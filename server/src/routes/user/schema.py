from typing import Optional
from pydantic import BaseModel, validator


class EditSettings(BaseModel):
    signin_code: bool
    email_code: str
    redirect_url: Optional[str] = None

    @validator("email_code")
    def email_code_validator(cls, v):
        code_len = len(v)
        if code_len > 20 or code_len < 8:
            raise ValueError(
                "The code's length must be between 8 and 20 characters long"
            )
        return v
