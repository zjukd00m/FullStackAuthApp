# FullStackAuthApp
An authentication web application using python and react with docker


## PgAdmin4

The webapp interface to manage postgresql servers can be configured in the docker compose file. A volume can be mapped from the local machine to the container's directory (/var/lib/pgadmin) but first make sure that the local directory belongs to the user 5050:

```bash
sudo chown -R 5050:5050 pgadmin_data
```

**Connecting to the postgresql server**

Once the postgresql container is running and the pgadmin one too, the connection parameters are:

```
# The name of the service as it is in the docker-compose file
hostname: postgres
```

## Server

Since FastAPI is an asyncrounous server it uses Uvicorn workers along with Gunicorn to "dispatch" multiple processes that are instances of the same server (in order to use _multiple cpu cores_).

The file _gunicorn.config.py_ can be edited to change the application settings.

The server can be executed in three ways:

1. Running the uvicorn process alone (supports HTTP/1.1 and websockets)
2. Running the gunicorn process with uvicorn workers
3. Using docker

If you're running it using any of the first two methods make sure to activate the environment and have installed __venv__ python's tool.

```bash
source .venv/bin/activate
```

__Using uvicorn__

Just run:

```bash
python main.py
```

__Using gunicorn__

Just run:

```bash
gunicorn -c ./gunicorn.conf.py
```

The main advantage of using _gunicorn_ is that it's a process manager that can spawn or fork multiple processes or _workers_ that are instances of the same server. If the server where it runs has multiple cores then more workers can be used to handle the requests.


__Using docker__

Make sure to have installed the latest docker cli and run:

```bash
docker compose up -d server
```

Using FastAPI autogenerates the endpoint documentation using the openapi schema and it's served at:

>   /docs
