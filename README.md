# FullStackAuthApp
An authentication web application using python and react with docker


## PgAdmin4

The webapp interface to manage postgresql servers can be configured in the docker compose file. A volume
can be mapped from the local machine to the container's directory (/var/lib/pgadmin) but first make sure that
the local directory belongs to the user 5050:

```bash
sudo chown -R 5050:5050 pgadmin_data
```

**Connecting to the postgresql server**

Once the postgresql container is running and the pgadmin one too, the connection parameters are:

```
# The name of the service as it is in the docker-compose file
hostname: postgres
```
