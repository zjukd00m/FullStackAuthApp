from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.authentication import requires
from sqlmodel import Session, select
from src.settings import HTML_TEMPLATES_DIR
from src.services.mailing import send_email
from src.utils.tokens import (
    add_expiration_time, 
    generate_random_code, 
    generate_email_code
)
from src.enums import TokenType
from ...models import Group, Token, User, UserGroup, Settings
from .schema import UserSignIn, UserSignUp, UserChangePassword
from ...utils.db import engine
from ...utils.auth import encode_payload, hash_password, verify_password

route = APIRouter()

templates = Jinja2Templates(directory=HTML_TEMPLATES_DIR)

# The sign up endpoint is only available for internal users
# And for external ones, they are added manually and the password
# can be added manually or generated automatically
@route.post("/signup")
def signup(_user: UserSignUp):
    _user.password = hash_password(_user.password)

    with Session(engine) as sess:
        query = select(User).where(User.email == _user.email)
        taken_user = sess.exec(query).first()

        if taken_user:
            raise HTTPException(400, "The email is already taken")

        # Accessing an attribute of an object after commit triggers
        # sql statement to fetch the id of the record
        user_data = _user.dict()

        del user_data["groups"]

        user = User(**user_data)

        sess.add(user)
        sess.commit()
        sess.refresh(user)

        # Create the user settings entity before commiting to the database
        email_code = generate_email_code()
        user_settings = Settings(
            signin_code=False,
            email_code=email_code,
            user_id=user.id,
        )

        sess.add(user_settings)

        # Add the user to the given groups
        if "OTHER" in _user.groups:
            other_group: Group = sess.exec(select(Group).where(Group.name == "OTHER")).first()
            if not other_group:
                raise HTTPException(500, "Missing OTHER group at db")

            # Create the user group row with OTHERS group
            sess.add(UserGroup(user_id=user.id, group_id=other_group.id))

        if "ADMIN" in _user.groups:
            admin_group: Group = sess.exec(select(Group).where(Group.name == "ADMIN")).first()
            if not admin_group:
                raise HTTPException(500, "Missing ADMIN group at db")

            # Create the user group row with ADMIN group
            sess.add(UserGroup(user_id=user.id, group_id=admin_group.id))

        # Create a new token that expires 1 hour after the request is made
        _token = generate_random_code(32)
        expires_at = add_expiration_time(3600)

        token = Token(token=_token, expires_at=expires_at, user_id=user.id, type=TokenType.ACCOUNT_CONFIRM)

        sess.add(token)
        sess.commit()
        sess.refresh(token)

        # Send confirmation email here...
        try:
            send_email(
                "Email confirmation",
                "EMAIL_CONFIRMATION",
                to=[user.email],
                args={
                    "token": token.token,
                    "email_code": email_code,
                    "user_email": user.email,
                },
            )
        except Exception as e:
            raise HTTPException(500, e.__str__())

        user = user.dict()
        del user["password"]

        return user


@route.post("/signin")
def signin(_user: UserSignIn):
    with Session(engine) as sess:
        query = select(User).where(User.email == _user.email)
        user: User = sess.exec(query).first()

        if not user:
            raise HTTPException(404, "auth.sign-in.invalid")

        valid_password = verify_password(_user.password, user.password)

        if not valid_password:
            raise HTTPException(400, "auth.invalid-user-or-password")

        # Verify if the user has the sign in code enabled
        user_settings: Settings = sess.exec(select(Settings).where(Settings.user_id == user.id)).first()

        if user_settings.signin_code:
            signin_code = _user.signin_code
            if not signin_code or not len(signin_code):
                raise HTTPException(422, "auth.missing-signin-code")

            # Verify the signin code is valid
            token: Token = sess.exec(select(Token).where(Token.token == signin_code)).first()

            if not token:
                raise HTTPException(404, "auth.token-not-found")

            if not token.is_valid():
                raise HTTPException(400, "auth.token-expired")

            sess.delete(token)

        # Get the user groups
        query = select(UserGroup, Group).where(UserGroup.user_id == user.id)
        user_groups = sess.exec(query).all()
        user_groups = list(map(lambda user_group: user_group[1].name, user_groups))

        # Update the user's last_sign_in date
        user.last_sign_in = datetime.now()
        sess.add(user)
        sess.commit()
        sess.refresh(user)

        payload = {"id": user.id, "email": user.email, "groups": user_groups}

        jwt = encode_payload(payload)

        response_content = {
            "message": "The user signed in successfully",
        }

        response = JSONResponse(content=response_content)

        response.set_cookie(key="auth_key", value=jwt, httponly=True)

        return response


@route.post("/signout")
@requires(["authenticated"])
def sign_out(request: Request):
    response_content = {
        "message": "The user signed out successfully",
    }
    response = JSONResponse(content=response_content)
    response.set_cookie(key="auth_key", value=None, httponly=True, max_age=0)
    return response


@route.get("/confirm")
def confirm_email(token: str, request: Request):
    with Session(engine) as sess:
        query = select(Token, User).where(Token.token == token)
        data = sess.exec(query).first()

        users = sess.exec(query).all()

        for _user in users:
            print(_user)

        if not data or not len(data) == 2:
            raise HTTPException(404, "auth-confirm.token-not-found")

        _token: Token = data[0]
        user: User = data[1]

        if not _token.is_valid():
            raise HTTPException(403, "auth-confirm.token-expired")

        _token.valid = False

        user.confirmed = True

        sess.add(user)
        sess.add(_token)

        sess.commit()

    return templates.TemplateResponse("email-confirmed.html", {"request": request})


@route.delete("/profile")
@requires(["authenticated"])
def delete_profile(request: Request):
    user_id = request.user.id
    try:
        with Session(engine) as sess:
            query = select(User).where(User.id == user_id)
            user = sess.exec(query).one()

            if not user:
                raise HTTPException(404, "user.not-found")

            sess.delete(user)
            sess.commit()

        response_content = {
            "message": "The account was deleted successfully",
        }
        response = JSONResponse(content=response_content)

        response.set_cookie(key="auth_key", value=None, httponly=True, max_age=0)

        return {"message": "user.deleted"}
    except Exception as e:
        raise HTTPException(500, e.__str__())


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


@route.post("/password/change")
@requires(["authenticated"])
def change_password(userData: UserChangePassword, request: Request):
    user_id = request.user.id
    current_password = userData.current_password
    new_password = userData.new_password
    confirm_password = userData.confirm_password

    if new_password != confirm_password:
        raise HTTPException(400, "Passwords does not match")

    with Session(engine) as sess:
        query = select(User).where(User.id == user_id)
        user: User = sess.exec(query).first()
        
        if not user:
            raise HTTPException(404, "user.not-found")

        if not verify_password(current_password, user.password):
            raise HTTPException(400, "user.password-mismatch")

        user.password = hash_password(new_password)

        sess.add(user)
        sess.commit()
        
        return {
            "message": "Password changed successfully"
        }
