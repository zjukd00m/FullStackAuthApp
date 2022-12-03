from typing import Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.authentication import requires
from sqlmodel import Session, select
from src.settings import HTML_TEMPLATES_DIR, CLIENT_URL
from src.services.mailing import send_email
from src.utils.tokens import (
    add_expiration_time,
    generate_random_code,
    generate_email_code,
)
from src.enums import TokenType
from ...models import Group, Token, User, UserGroup, Settings
from .schema import (
    UserSignIn,
    UserSignUp,
    UserChangePassword,
    ForgetPassword,
    RestorePassword,
)
from ...utils.db import engine
from ...utils.auth import encode_payload, hash_password, verify_password
from src.services.users.profile import get_user_settings, get_user_roles
from src.services.tokens import create_auth_token, last_token_expired
from src.responses.serializables import ORJSONResponse

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

        # Create the user settings entity before the commit to the database
        email_code = generate_email_code()
        user_settings = Settings(
            signin_code=False,
            email_code=email_code,
            user_id=user.id,
        )

        sess.add(user_settings)

        # Add the user to the given groups
        if "OTHER" in _user.groups:
            other_group: Group = sess.exec(
                select(Group).where(Group.name == "OTHER")
            ).first()
            if not other_group:
                raise HTTPException(500, "Missing OTHER group at db")

            # Create the user group row with OTHERS group
            sess.add(UserGroup(user_id=user.id, group_id=other_group.id))

        if "ADMIN" in _user.groups:
            admin_group: Group = sess.exec(
                select(Group).where(Group.name == "ADMIN")
            ).first()
            if not admin_group:
                raise HTTPException(500, "Missing ADMIN group at db")

            # Create the user group row with ADMIN group
            sess.add(UserGroup(user_id=user.id, group_id=admin_group.id))

        # Create a new token that expires 1 hour after the request is made
        _token = generate_random_code(32)
        expires_at = add_expiration_time(3600)

        token = Token(
            token=_token,
            expires_at=expires_at,
            user_id=user.id,
            type=TokenType.ACCOUNT_CONFIRM,
        )

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
def sign_in(_user: UserSignIn):
    with Session(engine) as sess:
        query = select(User).where(User.email == _user.email)
        user: User = sess.exec(query).first()

        if not user or not user.id:
            raise HTTPException(404, "auth.sign-in.invalid")

        valid_password = verify_password(_user.password, user.password)

        if not valid_password:
            raise HTTPException(400, "auth.invalid-user-or-password")

        # Verify if the user has the sign in code enabled
        user_settings: Settings = sess.exec(
            select(Settings).where(Settings.user_id == user.id)
        ).first()

        if user_settings.signin_code:
            signin_code = _user.signin_code
            if not signin_code or not len(signin_code):
                raise HTTPException(422, "auth.missing-signin-code")

            # Verify the signin code is valid
            token: Token = sess.exec(
                select(Token).where(Token.token == signin_code)
            ).first()

            if not token:
                raise HTTPException(404, "auth.token-not-found")

            if not token.type == TokenType.SIGNIN_CODE:
                raise HTTPException(400, "auth.token-incorrect-type")

            if not token.is_valid():
                raise HTTPException(400, "auth.token-expired")

            sess.delete(token)

        # Get the user groups
        user_groups = get_user_roles(user.id)

        # Update the user's last_sign_in date
        user.last_sign_in = datetime.now()
        sess.add(user)
        sess.commit()
        sess.refresh(user)

        payload = {"id": user.id, "email": user.email, "groups": user_groups}

        jwt = encode_payload(payload)

        # Return the user's data
        user_data = user.dict()
        del user_data["password"]

        response = ORJSONResponse({"message": "User signed in with success"})

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
    """
    Call this endpoint with a valid token of the ACCOUNT_CONFIRM type to confirm the user account.
    """
    with Session(engine) as sess:
        query = select(Token, User).where(Token.token == token)
        data = sess.exec(query).first()

        if not data or not len(data) == 2:
            raise HTTPException(404, "auth-confirm.token-not-found")

        _token: Token = data[0]
        user: User = data[1]

        if not _token.type == TokenType.ACCOUNT_CONFIRM:
            raise HTTPException(400, "auth-confirm.token-incorrect-type")

        if not _token.is_valid():
            raise HTTPException(403, "auth-confirm.token-expired")

        user.confirmed = True

        sess.add(user)
        sess.delete(_token)

        sess.commit()

    return templates.TemplateResponse("email-confirmed.html", {"request": request})


@route.delete("/profile")
@requires(["authenticated"])
def delete_profile(request: Request):
    """
    The user with an authenticated request can call this endpoint to delete the profile
    completely from the app and third party services.
    """
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
    """
    The user with the authenticated request gets the profile information.
    """
    user_id = request.user.id
    with Session(engine) as sess:
        query = select(User).where(User.id == user_id)
        user = sess.exec(query).first()

        if not user or not user.id:
            raise HTTPException(404, "user.not-found")

        user_groups = get_user_roles(user.id)
        user_settings = get_user_settings(user.id)

        user_data = user.dict()

        del user_data["password"]

        return {**user_data, "groups": user_groups, "settings": user_settings}


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
        user = sess.exec(query).first()

        if not user:
            raise HTTPException(404, "user.not-found")

        if not verify_password(current_password, user.password):
            raise HTTPException(400, "user.password-mismatch")

        last_password = user.password

        hashed_new_password = hash_password(new_password)

        if last_password == hashed_new_password:
            raise HTTPException(400, "user.password-may-be-used-before")

        user.password = hashed_new_password

        sess.add(user)
        sess.commit()

        return {"message": "Password changed successfully"}


@route.post("/password/restore")
def restore_password(restorePassword: RestorePassword):
    email = restorePassword.email
    password = restorePassword.password

    with Session(engine) as sess:
        query = select(User).where(User.email == email)
        user: Optional[User] = sess.exec(query).first()

        if not user:
            raise HTTPException(404, "user.not-found")

        hashed_password = hash_password(password)

        user.password = hashed_password

        sess.add(user)
        sess.commit()

    return 200


@route.post("/password/forget")
def forget_password(forgetPassword: ForgetPassword):
    email = forgetPassword.email

    with Session(engine) as sess:
        query = select(User).where(User.email == email)
        user: Optional[User] = sess.exec(query).first()

        if not user or not user.id:
            raise HTTPException(404, "user.not-found")

        # Verify if the RESET_PASSWORD token was already generated
        if not last_token_expired(user.id):
            raise HTTPException(400, "token.password-reset-token-not-expired")

        # Get the email code from the user settings
        user_settings = get_user_settings(user.id)

        if not user_settings:
            raise HTTPException(404, "user.missing-settings-table")

        email_code = user_settings.dict().get("email_code")

        auth_token = create_auth_token(user.id, 33, 60 * 5, TokenType.RESET_PASSWORD)

        sess.add(auth_token)
        sess.commit()

        password_reset_code = auth_token.token

        restore_password_url = f"{CLIENT_URL}/password-reset?code={password_reset_code}"

        send_email(
            "Restore your password",
            "RESET_PASSWORD",
            [user.email],
            None,
            {
                "email_code": email_code,
                "restore_password_url": restore_password_url,
            },
        )

    return {
        "message": "The forget email password was sent successfully",
    }
