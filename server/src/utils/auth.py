import jwt
import hashlib
from typing import Dict
from jwt.exceptions import InvalidSignatureError, ExpiredSignatureError, DecodeError
from datetime import datetime, timedelta
from ..settings import JWT_SECRET


def encode_payload(payload: Dict) -> str:
    iat = datetime.utcnow()
    exp = iat + timedelta(hours=1)

    data = {**payload, "iat": iat, "exp": exp}
    return jwt.encode(data, JWT_SECRET, "HS256")


def verify_token(token: str) -> Dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms="HS256")
        return payload, None
    except InvalidSignatureError:
        return None, "token.invalid-siganutre"
    except ExpiredSignatureError:
        return None, "token.expired-signarure"
    except DecodeError:
        return None, "token.decode-error"


def hash_password(password: str) -> str:
    return hashlib.sha3_256(password.encode()).hexdigest()


def verify_password(password: str, hashed_password: str) -> bool:
    hashed_user_password = hash_password(password)
    return True if hashed_user_password == hashed_password else False
