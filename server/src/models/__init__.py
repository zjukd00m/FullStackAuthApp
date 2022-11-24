"""
# This way we tell sqlmodel that the age is not a required field to be validated
# and we tell SQL database that this field is nullable
age: Optional[int] = None
"""
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from src.utils.tokens import generate_random_code
from src.settings import DEFAULT_AVATAR_URL
from src.enums import GroupType, TokenType

class UserGroup(SQLModel, table=True):
    __tablename__ = "user_groups"

    user_id: Optional[int] = Field(
        default=None, foreign_key="users.id", primary_key=True
    )
    group_id: Optional[int] = Field(
        default=None, foreign_key="roles.id", primary_key=True
    )
    

class User(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email"),)
    
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

    groups: List["Group"] = Relationship(
        sa_relationship=relationship("Group", secondary="UserGroup", cascade="all, delete-orphan", back_populates="users")
    )

    templates: List["Template"] = Relationship(
        sa_relationship=relationship("Template", cascade="all, delete-orphan", back_populates="users")
    )

    settings = Relationship(
        sa_relationship=relationship("Settings", back_populates="users", uselist=False)
    )


class Settings(SQLModel, table=True):
    __tablename__ = "settings"
    __table_args__ = (UniqueConstraint("email_code"),) 
    
    id: Optional[int] = Field(default=None, primary_key=True)
    signin_code: bool = Field(default=False)
    email_code: str = Field(default="")
    redirect_url: str = Field(default="", nullable=True)   # The url for the users to ne redirected on login

    user_id: Optional[int] = Field(default=None, foreign_key="users.id")

    user: User = Relationship(
        sa_relationship=relationship("User", back_populates="settings")
    )


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    url: str
    document_type: str

    user_id: Optional[int] = Field(default=None, foreign_key="users.id")


class APIKey(SQLModel, table=True):
    __tablename__ = "apikeys"
    __table_args__ = (UniqueConstraint("key"),)
    
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str
    expirationTime: int = 60 * 60  # 3600 seconds (1 hour)


class Group(SQLModel, table=True):
    __tablename__ = "roles"
    __table_args__ = (UniqueConstraint("name"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    name: GroupType

    users: List["User"] = Relationship(
        sa_relationship=relationship("User", secondary="UserGroupTable", cascade="all, delete", back_populates="settings")
    )


class Template(SQLModel, table=True):
    __tablename__ = "templates"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str

    user_id: Optional[int] = Field(default=None, foreign_key="users.id")

    user: User = Relationship(
        sa_relationship=relationship("User", back_populates="templates")
    )

class Perms(SQLModel, table=True):
    """
    This table will be used for grained permissions
    """
    __tablename__ = "permissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    read: bool = Field(default=False)
    write: bool = Field(default=False)


class Token(SQLModel, table=True):
    __tablename__ = "tokens"
    __table_args__ = (UniqueConstraint("token"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(nullable=False)
    expires_at: datetime = Field(nullable=False)
    valid: bool = Field(default=True)
    type: TokenType = Field(nullable=False)

    user_id: Optional[int] = Field(default=None, foreign_key="users.id")

    def is_valid(self) -> bool:
        current_time = datetime.now()
        if current_time < self.expires_at and self.valid:
            return True
        return False
