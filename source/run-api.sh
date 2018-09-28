#!/bin/bash

env

if [ "$DB_BOOTSTRAP" -eq "1" ]; then
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres \
    -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 && \
    PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres \
    -c "DROP DATABASE $POSTGRES_DB"
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres \
    -c "CREATE DATABASE $POSTGRES_DB WITH ENCODING 'UTF8'"
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/DWKitScript.sql
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/Workflow_CreatePersistenceObjects.sql 
fi

# run api migrations
PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
  -f /app/scripts/api_migrations.sql

if [ "$DB_BOOTSTRAP" -eq "1" ]; then
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/application_types.sql
fi

if [ "$DB_SAMPLEDATA" -eq "1" ]; then
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/sample_data.sql
fi

# start api server
dotnet "OptimaJet.DWKit.StarterApplication.dll"
