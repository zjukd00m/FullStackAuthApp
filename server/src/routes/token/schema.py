from pydantic import BaseModel
from typing import Literal, Optional


class CreateTokenInput(BaseModel):
    email: str
    length: Optional[int] = 5
