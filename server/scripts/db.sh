#!/bin/bash

# Run the database with the given params

POSTGRES_USER=$1
POSTGRES_PASSWORD=$2
POSTGRES_DB=$3

docker run -itd --rm \
    --name postgres \
    -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    -e POSTGRES_USER=$POSTGRES_USER \
    -e POSTGRES_DB=$POSTGRES_DB \
    -p 5432:5432 \
    postgres
