from enum import Enum


class GroupType(str, Enum):
    ADMIN = "ADMIN"
    OTHER = "OTHER"


class TokenType(str, Enum):
    ACCOUNT_CONFIRM = "ACCOUNT_CONFIRM"
    SIGNIN_CODE = "SIGNIN_CODE"
    OTHER = "OTHER"
