from typing import List, Optional
from pydantic import BaseModel, validator
from email_validator import validate_email, EmailNotValidError
from src.validators import validate_password


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

    @validator("password")
    def password_validator(cls, v):
        valid_password = validate_password(v)
        if not valid_password:
            raise ValueError("Password is insecure")
        return v


class UserSignIn(BaseModel):
    email: str
    password: str
    signin_code: Optional[str] = None

    @validator("email")
    def email_validator(cls, v):
        try:
            email = validate_email(v).email
        except EmailNotValidError as e:
            raise ValueError(e.__str__())
        return email


class UserChangePassword(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @validator("new_password")
    def new_password_validator(cls, v):
        valid_password = validate_password(v)
        if not valid_password:
            raise ValueError("Password is insecure")
        return v

    @validator("confirm_password")
    def confirm_password_validator(cls, v):
        valid_password = validate_password(v)
        if not valid_password:
            raise ValueError("Password is insecure")
        return v


class RestorePassword(BaseModel):
    email: str
    password: str

    @validator("password")
    def password_validator(cls, v):
        valid_password = validate_password(v)
        if not valid_password:
            raise ValueError("Password is insecure")
        return v


class ForgetPassword(BaseModel):
    email: str

    @validator("email")
    def email_validator(cls, v):
        try:
            email = validate_email(v).email
        except EmailNotValidError as e:
            raise ValueError(e.__str__())
        return email
