import os
from dotenv import load_dotenv


load_dotenv(dotenv_path="./.env.development")

HOST = os.getenv("HOST")
PORT = os.getenv("PORT")


wsgi_app = "src.index:app"

reload = True

bind = f"{HOST}:{PORT}"

# Maximum number of pending connections a worker thread can handle
# Must be in the range [64. 2048]
backlog = 2048

# The recommended setting for production
# workers = multiprocessing.cpu_count() * 2 + 1
workers = 4

# The type of worker to use
# Since we want the ASGI uvicorn to be served through gunicorn which is WSGI (sync)
worker_class = "uvicorn.workers.UvicornWorker"

# Number of worker threads
# Recommended for production: 2 - 4 * NUM_CORES
threads = 1

# Number of HTTP headers in a request (at most) - To prevent DDoS attacks where headers are flooded
# By default the value is 100 and the maximum value allowed is 32768
limit_request_fields = 100

# Maximum size of an HTTP header
# Bym default is set to 8190
limit_request_field_size = 8190


# * Server hooks
def on_starting(server):
    print("The gunicorn application is starting...")


def on_reload(server):
    print("The server will be reloaded...")


def on_exit(server):
    print("The server will exit...")


def pre_request(worker, req):
    print("Incoming request")
    worker.log.debug("%s %s", (req.method, req.path))
