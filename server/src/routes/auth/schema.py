import re
from typing import List, Optional
from pydantic import BaseModel, validator
from email_validator import validate_email, EmailNotValidError


# def validate_password(password: str) -> bool:
#     special = 0
#     uppercase = 0
#     numbers = 0

#     for c in password:
#         if re.fullmatch("\d", c):
#             numbers += 1
#         elif re.fullmatch("[\$\^\\#_~+-/]", c):
#             special += 1
#         elif re.fullmatch("[A-Z]", c):
#             uppercase += 1

#     if numbers >= 2 and special >= 2 and uppercase >= 2 and len(password) >= 8:
#         return True

#     return False


class UserSignUp(BaseModel):
    email: str
    password: str
    groups: Optional[List[str]] = ["OTHER"]

    @validator("email")
    def email_validator(cls, v):
        try:
            email = validate_email(v).email
        except EmailNotValidError as e:
            raise ValueError(e.__str__())
        return email

    # @validator("password")
    # def password_validator(cls, v):
    #     valid_password = validate_password(v)
    #     if not valid_password:
    #         raise ValueError("Password is insecure")
    #     return v


class UserSignIn(BaseModel):
    email: str
    password: str


class UserChangePassword(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
