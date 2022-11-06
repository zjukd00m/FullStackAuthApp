import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.middleware.authentication import AuthenticationMiddleware
from sqlmodel import SQLModel
from .utils.db import engine, init_db
from .middleware.auth import JWTMiddleware
from .middleware.shield import ShieldMiddleware
from .routes import auth, token, user, mailing
from .settings import HTML_TEMPLATES_DIR, STATIC_FILES_DIR


INIT_DB = True

templates = Jinja2Templates(directory=HTML_TEMPLATES_DIR)

app = FastAPI()


app.mount("/static", StaticFiles(directory=STATIC_FILES_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthenticationMiddleware, backend=JWTMiddleware())
app.add_middleware(ShieldMiddleware)

app.include_router(
    auth.route,
    prefix="/api/auth",
    tags=["auth"],
)

app.include_router(token.route, prefix="/api/tokens", tags=["tokens"])

app.include_router(user.route, prefix="/api/users", tags=["users"])

app.include_router(mailing.route, prefix="/api/mailing", tags=["mailing"])

@app.on_event("startup")
def init_app():
    print("The app started")
    try:
        init_db()
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(e.__str__())
        sys.exit(1)
