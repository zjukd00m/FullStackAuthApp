"""
# This way we tell sqlmodel that the age is not a required field to be validated
# and we tell SQL database that this field is nullable
age: Optional[int] = None
"""
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

DEFAULT_AVATAR_URL = "https://toppng.com/public/uploads/preview/batman-icon-jira-avatar-11562897771zvwv8r510z.png"


class User(SQLModel, table=True):
    # Avoid passing None when creating the entity
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    confirmed: bool = Field(default=False)
    active: bool = Field(default=True)
    last_sign_in: datetime = Field(default=None, nullable=True)
    display_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar: Optional[str] = Field(default=DEFAULT_AVATAR_URL)


class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    url: str
    document_type: str

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")


class APIKey(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str
    expirationTime: int = 60 * 60  # 3600 seconds (1 hour)


class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
 

class Perms(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    read: bool = Field(default=False)
    write: bool = Field(default=False)


class Token(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(nullable=False)
    expires_at: datetime = Field(nullable=False)
    scanned: bool = Field(default=False)

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")

    
    def is_valid(self) -> bool:
        current_time = datetime.now()
        if current_time < self.expires_at and not self.scanned:
            return True
        return False
