from sqlmodel import Session, select
from sqlalchemy.sql import text
from datetime import datetime
from src.models import Token
from src.utils.tokens import generate_random_code, add_expiration_time
from src.settings import TOKEN_EXPIRATION_TIME
from src.enums import TokenType
from src.utils.db import engine


def last_token_expired(user_id: int) -> bool:
    """
    Verify if the last token generated for the user already expired

    Args:
        token_id (int): _description_

    Returns:
        bool: _description_
    """
    with Session(engine) as sess:
        result = sess.execute(text(F"""
            SELECT expires_at, valid
            FROM tokens
            WHERE user_id = {user_id}
            AND expires_at = (
                SELECT MAX(expires_at)
                FROM tokens
                WHERE user_id = {user_id}
            );
        """)).first()

        # There are no tokens
        if not result:
            return True

        # The result is defined (a tupple)
        expires_at, valid = result

        now = datetime.now()

        # Token has not expired yet and it's not valid
        if expires_at > now and valid:
            return False

        return True


def create_auth_token(
        user_id: int,
        length: int = 5,
        expiration_time: int = TOKEN_EXPIRATION_TIME,
        type: TokenType = TokenType.OTHER
) -> Token:
    """
    Creates a token entity for the user with the given id.
    If not type is specified then the default TokenType is OTHER

    Args:
        user_id (int): _description_
        expiration_time (Optional[int], optional): _description_. Expiration time in seconds
        length (Optional[int], optional): _description_. Defaults to 5.
        type (Optional[TokenType], optional): _description_. Defaults to OTHER

    Returns:
        Token: The Token entity
    """
    code = generate_random_code(length)
    expires_at = add_expiration_time(expiration_time)

    token = Token(token=code, expires_at=expires_at, user_id=user_id, type=type)

    return token
