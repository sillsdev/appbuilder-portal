#!/bin/bash

# run migrations
PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -f migrations.sql

# start api server
dotnet Optimajet.DWKit.StarterApplication.dll

