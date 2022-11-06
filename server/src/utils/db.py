from sqlmodel import Session, select
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.settings import POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST
from src.models import Group


POSTGRES_PORT = 5432

DB_URI = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}"
)

# Enable while on debug mode to track the database logs
engine = create_engine(DB_URI, echo=False, future=True)

session = sessionmaker(engine, expire_on_commit=False)


def init_db():
    with Session(engine) as sess:
        groups = sess.exec(select(Group)).all()

        if not len(groups):
            admin_group = Group(name="ADMIN")
            others_group = Group(name="OTHERS")

            sess.add(admin_group)
            sess.add(others_group)

            sess.commit()