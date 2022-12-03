from sqlmodel import Session, select
from src.utils.db import engine
from sqlalchemy import inspect


def get_latest_user_token():
    inspector = inspect(engine)


if __name__ == "__main__":
    get_latest_user_token()