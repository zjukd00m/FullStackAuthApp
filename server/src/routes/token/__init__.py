from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from sqlalchemy.sql.functions import func
from datetime import datetime
from src.utils.tokens import add_expiration_time, generate_random_code
from src.utils.db import engine
from src.models import User, Token


route = APIRouter()


@route.get("/")
def generate_token(email: str):
    with Session(engine) as sess:
        query = select(User).where(User.email == email)
        user: User = sess.exec(query).first()

        if not user:
            raise HTTPException(404, "generate-token.user-not-found")

        subquery = select(func.max(Token.expires_at)).where(Token.user_id == user.id)
        date_last_token = sess.exec(subquery).first()

        if not date_last_token:
            raise HTTPException(404, "generate-token.user-has-not-previous-tokens")

        query = select(Token).where(Token.expires_at >= date_last_token, Token.user_id == user.id)
        last_token: Token = sess.exec(query).first()

        if last_token.expires_at > datetime.now() and not last_token.scanned:
            raise HTTPException(400, "generate-token.user-last-token-has-not-expired")

        _token = generate_random_code(33)
        expires_at = add_expiration_time(60 * 5)

        token = Token(token=_token, expires_at=expires_at, user_id=user.id)

        sess.add(token)
        sess.commit()
        sess.refresh(token)

        return token.__dict__


@route.post("/")
def validate_token(token: str):
    with Session(engine) as sess:
        query = select(Token).where(Token.token == token)
        _token: Token = sess.exec(query).first()

        if not _token:
            raise HTTPException(404, "validate-token.token-not-found")

        if _token.scanned:
            raise HTTPException(400, "validate-token.token-already-scanned")

        if _token.expires_at < datetime.now():
            raise HTTPException(400, "validate.token.token-expired")

        _token.scanned = True

        sess.add(_token)
        sess.commit()
        sess.refresh(_token)

        return _token.__dict__
