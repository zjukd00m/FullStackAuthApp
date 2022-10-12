from typing import List, Union, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlmodel import Session, select
from src.models import Token, User
from src.utils.db import engine


route = APIRouter()


class UserEditInput(BaseModel):
    active: bool
    phone_number: str
    display_name: str
    avatar: Optional[str]


@route.get("/")
def get_users(query: Union[str, None] = None):
    with Session(engine) as sess:
        _query = select(User)

        parsed_users = []

        if query and len(query):
            query = query.strip()
            _query = F"""
            SELECT
                id,
                email,
                created_at,
                confirmed,
                active,
                last_sign_in,
                display_name,
                phone_number,
                avatar
            FROM public.user 
            WHERE email ILIKE '{query}%' 
            ORDER BY email DESC; 
            """
            users = sess.exec(_query).all()
            
            for user in users:
                parsed_users.append(jsonable_encoder(dict(user)))
        else:
            users: List[User] = sess.exec(_query).all()
            _users = jsonable_encoder(users)

            for user in _users:
                del user["password"]
                parsed_users.append(user)

        return parsed_users



@route.get("/{user_id}")
def get_user(user_id: int):
    with Session(engine) as sess:
        print(user_id)
        query = select(User).where(User.id == user_id)
        user: User = sess.exec(query).first()

        if not user:
            raise HTTPException(404, "get-user.user-not-found")

        return jsonable_encoder(user)


@route.delete("/{user_id}")
def delete_user(user_id: int):
    with Session(engine) as sess:
        # First, delete all the user dependent tables
        query = select(Token).where(Token.user_id == user_id)
        tokens = sess.exec(query).all()

        if tokens:
            for token in tokens:
                sess.delete(token)
            sess.commit()

        query = select(User).where(User.id == user_id)
        user: User = sess.exec(query).first()

        if not user:
            raise HTTPException(404, "delete-user.user-not-found")
            
        sess.delete(user)
        sess.commit()

        return {
            "message": "User was deleted successfully"
        }

@route.put("/{user_id}")
def edit_user(user_id: int, user_data: UserEditInput):
    with Session(engine) as sess:
        query = select(User).where(User.id == user_id)
        user: User = sess.exec(query).first()
        if not user:
            raise HTTPException(404, "edit-user.user-not-found")

        edit_user = False
        
        if user_data.active != None and user_data.active != user.active:
            user.active = user_data.active
            edit_user = True

        if user_data.avatar != user.avatar:
            user.avatar = user_data.avatar
            edit_user = True

        if user_data.display_name != user.display_name:
            user.display_name = user_data.display_name
            edit_user = True

        if user_data.phone_number != user.phone_number:
            user.phone_number = user_data.phone_number
            edit_user = True

        if edit_user:
            sess.add(user)
            sess.commit()
            sess.refresh(user)

        return user.__dict__
