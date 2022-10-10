from os import path, getenv
import dotenv

BASE_DIR = path.dirname(path.dirname(__file__))

dotenv_path = path.join(BASE_DIR, ".env.development")

dotenv.load_dotenv(dotenv_path)

POSTGRES_HOST = getenv("POSTGRES_HOST")
POSTGRES_PASSWORD = getenv("POSTGRES_PASSWORD")
POSTGRES_DB = getenv("POSTGRES_DB")
POSTGRES_USER = getenv("POSTGRES_USER")
JWT_SECRET = getenv("JWT_SECRET")
MAILJET_API_KEY = getenv("MAILJET_API_KEY")
MAILJET_API_SECRET = getenv("MAILJET_API_SECRET")


HTML_TEMPLATES_DIR = path.join(BASE_DIR, "client", "templates")
STATIC_FILES_DIR = path.join(BASE_DIR, "client", "static")
