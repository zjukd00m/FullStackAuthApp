from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.authentication import requires
from sqlmodel import Session, select
from src.settings import HTML_TEMPLATES_DIR
from src.services.mailing import send_email
from src.utils.tokens import add_expiration_time, generate_random_code, validate_token
from ...models import Group, Token, User
from .schema import UserSignIn, UserSignUp
from ...utils.db import engine
from ...utils.auth import encode_payload, hash_password, verify_password


route = APIRouter()

templates = Jinja2Templates(directory=HTML_TEMPLATES_DIR)

# The sign up endpoint is only available for internal users
# And for external ones, they are added manually and the password
# can be added manually or generated automatically
@route.post("/signup")
def signup(_user: UserSignUp):
    import warnings

    warnings.filterwarnings(
        "ignore",
        ".*Class SelectOfScalar will not make use of SQL compilation caching.*",
    )
    _user.password = hash_password(_user.password)

    with Session(engine) as sess:
        print("-" * 20)
        query = select(User).where(User.email == _user.email)
        taken_user = sess.exec(query).first()

        if taken_user:
            raise HTTPException(400, "The email is already taken")

        # Accessing an attribute of an object after commit triggers
        # sql statement to fetch the id of the record
        user_data = _user.dict()
        user_groups = user_data.get("groups", ["OTHER"])

        del user_data["groups"]

        user = User(**user_data)

        # Add the user to the given groups
        user_groups_db: List[Group] = []

        print("-" * 20)
        print("WILL FIND THE USER ROLES")

        if "OTHER" in _user.groups:
            query = select(Group).where(Group.name == "OTHER")
            other_group: Group = sess.exec(query).first()
            if not other_group:
                raise HTTPException(500, "Missing OTHER group at db")
            user_groups_db.append(other_group)

        if "ADMIN" in _user.groups:
            query = select(Group).where(Group.name == "ADMIN")
            admin_group: Group = sess.exec(query).first()
            if not admin_group:
                raise HTTPException(500, "Missing ADMIN group at db")
            user_groups_db.append(admin_group)

        user.groups = user_groups_db

        sess.add(user)
        sess.commit()
        sess.refresh(user)

        # Create a new token that expires 1 hour after the request is made
        _token = generate_random_code(32)
        expires_at = add_expiration_time(3600)

        token = Token(token=_token, expires_at=expires_at, user_id=user.id)

        sess.add(token)
        sess.commit()
        sess.refresh(token)

        # Send confirmation email here...
        try:
            send_email(
                "Email confirmation",
                "EMAIL_CONFIRMATION",
                to=[user.email],
                args={"token": token.token},
            )
        except Exception as e:
            raise HTTPException(500, e.__str__())

        user = user.dict()
        del user["password"]

        return user


@route.post("/signin")
def signin(_user: UserSignIn):
    import warnings

    warnings.filterwarnings(
        "ignore",
        ".*Class SelectOfScalar will not make use of SQL compilation caching.*",
    )

    with Session(engine) as sess:
        query = select(User).where(User.email == _user.email)
        user: User = sess.exec(query).first()

        if not user:
            raise HTTPException(404, "auth.sign-in.invalid")

        valid_password = verify_password(_user.password, user.password)

        if not valid_password:
            raise HTTPException(400, "auth.invalid-user-or-password")

        # Update the user's last_sign_in date
        user.last_sign_in = datetime.now()
        sess.add(user)
        sess.commit()
        sess.refresh(user)

        user_groups = [group.name for group in user.groups]

        payload = {"id": user.id, "email": user.email, "groups": user_groups}

        jwt = encode_payload(payload)

        response_content = {
            "message": "The user signed in successfully",
        }

        response = JSONResponse(content=response_content)

        response.set_cookie(key="auth_key", value=jwt, httponly=True)

        return response


@route.post("/signout")
def sign_out(request: Request):
    response_content = {
        "message": "The user signed out successfully",
    }
    response = JSONResponse(content=response_content)
    response.set_cookie(key="auth_key", value=None, httponly=True, max_age=0)
    return response


@route.get("/confirm/")
def confirm_email(token: str, request: Request):
    with Session(engine) as sess:
        query = select(Token, User).where(Token.token == token)
        _token = sess.exec(query).first()

        if not _token or not len(_token) == 2:
            raise HTTPException(404, "auth-confirm.token-not-found")

        token: Token = _token[0]
        user: User = _token[1]

        if not token.is_valid():
            raise HTTPException(403, "auth-confirm.token-expired")

        user.confirmed = True

        sess.add(user)
        sess.delete(token)
        sess.commit()

    return templates.TemplateResponse("email-confirmed.html", {"request": request})


@route.delete("/{user_id}")
def delete_user(user_id: int):
    with Session(engine) as sess:
        query = select(User).where(User.id == user_id)
        user = sess.exec(query).one()

        if not user:
            raise HTTPException(404, "user.not-found")

        sess.delete(user)
        sess.commit()

    return {"message": "user.deleted"}


@route.get("/profile")
@requires(["authenticated"])
def get_profile(request: Request):
    user_id = request.user.id
    with Session(engine) as sess:
        query = select(User, Group).where(User.id == user_id)
        _user, _groups = sess.exec(query).first()

        user = _user.dict()
        groups = _groups.dict()

        del user["password"]

        return {**user, "groups": groups}
