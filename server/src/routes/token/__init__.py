from fastapi import APIRouter, HTTPException
from src.services.mailing import send_email
from sqlmodel import Session, select
from sqlalchemy.sql.functions import func
from datetime import datetime
from src.utils.tokens import add_expiration_time, generate_random_code
from src.utils.db import engine
from src.models import User, Token
from src.settings import TOKEN_EXPIRATION_TIME
from .schema import CreateTokenInput

route = APIRouter()


def create_auth_token(user_id: int, length: int = 5, expiration_time: int = TOKEN_EXPIRATION_TIME) -> Token:
    """
    Creates a token entity for the user with the given id

    Args:
        user_id (int): _description_
        expiration_time (Optional[int], optional): _description_. Defaults to TOKEN_EXPIRATION_TIME.
        length (Optional[int], optional): _description_. Defaults to 5.

    Returns:
        Token: _description_
    """
    code = generate_random_code(length)
    expires_at = add_expiration_time(expiration_time)

    token = Token(token=code, expires_at=expires_at, user_id=user_id)

    return token


@route.post("/")
def generate_token(token_input: CreateTokenInput):
    """
    Generate and send (optionally) an email to the account that belongs to the provided
    user id (if it exists).
    If the user doesn't exists then the endpoint will raise an expection with the 404 code
    Args:
        token_input (CreateTokenInput): _description_

    Raises:
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        _type_: Response
    """

    email = token_input.email
    length = token_input.length

    # The token's length must be bounded
    # And if not specified then 5 is the default value
    if length and (length <= 5 or length >= 33):
        raise HTTPException(400, "Length parameter must be between 5 and 33")
    else:
        length = 5

    with Session(engine) as sess:
        query = select(User).where(User.email == email)
        user = sess.exec(query).first()

        if not user:
            raise HTTPException(404, "auth/user-not-found")

        # Get the token with the lastest expiration time of the user
        subquery = select(func.max(Token.expires_at)).where(Token.user_id == user.id)
        date_last_token = sess.exec(subquery).first()

        # Make sure the latest token for the given user has been already read or expired
        if date_last_token:
            query = select(Token).where(
                Token.expires_at >= date_last_token, Token.user_id == user.id
            )
            last_token: Token = sess.exec(query).first()

            if last_token.expires_at > datetime.now() and not last_token.scanned:
                raise HTTPException(400, "token.user-last-token-has-not-been-invalidated")

        token = create_auth_token(user.id)

        sess.add(token)
        sess.commit()
        sess.refresh(token)

        # Send the token code to the user email
        send_email(
            "Your authentication token", 
            "AUTHENTICATION_TOKEN",
            [user.email],
            attachments=None,
            args={
                "token": token.token,
            } 
        ) 

        return token.__dict__


@route.post("/validate/{code}")
def validate_token(code: str):
    with Session(engine) as sess:
        query = select(Token).where(Token.token == code)
        token: Token = sess.exec(query).first()

        if not token:
            raise HTTPException(404, "validate-token.token-not-found")

        if token.scanned:
            raise HTTPException(400, "validate-token.token-already-scanned")

        if token.expires_at < datetime.now():
            raise HTTPException(400, "validate.token.token-expired")

        token.scanned = True

        sess.add(token)
        sess.commit()
        sess.refresh(token)

        return token.__dict__


@route.get("/{token_id}")
def get_token(token_id: int):
    with Session(engine) as sess:
        query = select(Token).where(Token.id == token_id)
        token: Token = sess.exec(query).first()

        if not token:
            raise HTTPException(404, "token.not-found")

        return token.__dict__
