If developing locally, it's better to run the database inside the docker container while the python server is at the filesystem as it is by default.

```sh
# Start the database in the docker container
export POSTGRES_SERVICE=''
export POSTGRES_USER=tylderdurden
export POSTGRES_PASSWORD=fightclub
export POSTGRESS_DATABASE=wpy

sudo docker run -itd --rm --name $POSTGRES_SERVICE \
    -e POSTGRES_USER=$POSTGRES_USER \
    -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    -e POSTGRES_DB=$POSTGRES_DB \
    -p 5432:5432 \
    postgres
```

If developing locally but attaching the current directory as a volume (live code edition inside the container):

```sh
sudo docker compose --env-file ./.env.development up -d
```

**TO SPAWN FIRST THE DATABASE**

```sh
docker compose --env-file ./.env.development up -d wpy
```

**Keepin' code clean and formatted**

Black guide:
- https://black.readthedocs.io/en/stable/the_black_code_style/current_style.html