from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.settings import POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST


POSTGRES_PORT = 5432

DB_URI = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}"
)

# Enable while on debug mode to track the database logs
engine = create_engine(DB_URI, echo=False, future=True)

session = sessionmaker(engine, expire_on_commit=False)
