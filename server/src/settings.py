from os import path, getenv
import dotenv

BASE_DIR = path.dirname(path.dirname(__file__))

dotenv_path = path.join(BASE_DIR, ".env.development")

dotenv.load_dotenv(dotenv_path)

TOKEN_EXPIRATION_TIME = 60 * 3

POSTGRES_HOST = getenv("POSTGRES_HOST")
POSTGRES_PASSWORD = getenv("POSTGRES_PASSWORD")
POSTGRES_DB = getenv("POSTGRES_DB")
POSTGRES_USER = getenv("POSTGRES_USER")
JWT_SECRET = getenv("JWT_SECRET")
MAILJET_API_KEY = getenv("MAILJET_API_KEY")
MAILJET_API_SECRET = getenv("MAILJET_API_SECRET")

RAPID_API_KEY_SEND_GRID = getenv("RAPID_API_KEY_SEND_GRID")
RAPID_API_HOST_SEND_GRID = getenv("RAPID_API_HOST_SEND_GRID")

HTML_TEMPLATES_DIR = path.join(BASE_DIR, "client", "templates")
STATIC_FILES_DIR = path.join(BASE_DIR, "client", "static")

DEFAULT_AVATAR_URL = "https://imgs.search.brave.com/JLlni9aj4JX8TDmpTyNuS4FbTsU3KX1rVwBpa2Q2OtI/rs:fit:512:512:1/g:ce/aHR0cHM6Ly9pY29u/LWxpYnJhcnkuY29t/L2ltYWdlcy9hbm9u/eW1vdXMtYXZhdGFy/LWljb24vYW5vbnlt/b3VzLWF2YXRhci1p/Y29uLTEzLmpwZw"
