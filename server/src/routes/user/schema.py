from fastapi import APIRouter, request
from sqlmodel import Session
from src.utils.db import engine


route = APIRouter()


@route.get("/")
def get_users():
    with Session(engine) as sess:
        pass

    return 201
