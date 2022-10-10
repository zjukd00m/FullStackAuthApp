from re import L
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from src.settings import HTML_TEMPLATES_DIR


templates = Jinja2Templates(directory=HTML_TEMPLATES_DIR)

router = APIRouter()


@router.get("/")
def projects(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})
