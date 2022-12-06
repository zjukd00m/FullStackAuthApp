from pydantic import BaseModel
from src.enums import TokenType


class CreateTokenInput(BaseModel):
    user_email: str
    token_type: TokenType
