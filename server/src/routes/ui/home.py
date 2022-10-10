from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select
from src.models import Profile
from src.utils.db import engine
from src.settings import HTML_TEMPLATES_DIR


templates = Jinja2Templates(directory=HTML_TEMPLATES_DIR)

router = APIRouter()


@router.get("/")
def home(request: Request):
    users = []

    with Session(engine) as sess:
        query = select(Profile)
        # This is the SQLAlchemy version and it's not
        # users = sess.execute(query).scalars().all()
        users = sess.exec(query).all()
        if len(users):
            users = list(map(lambda user: user.dict(), users))

    return templates.TemplateResponse(
        "index.html", {"request": request, "users": users}
    )
