#!/bin/bash

env

if [ "$DB_BOOTSTRAP" -eq "1" ]; then
  # Terminate  all other database connections before dropping the database
  # https://stackoverflow.com/a/5408501/35577
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres \
    -tc "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$POSTGRES_DB' AND pid <> pg_backend_pid()"
  # If database already exists, then drop the database
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres \
    -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 && \
    PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres \
    -c "DROP DATABASE $POSTGRES_DB"
  # Create the database
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres \
    -c "CREATE DATABASE $POSTGRES_DB WITH ENCODING 'UTF8'"
  # Create tables requried by DWKit
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/DWKitScript.sql
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/Workflow_CreatePersistenceObjects.sql 
fi

# run api migrations
PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
  -f /app/scripts/api_migrations.sql

if [ "$DB_BOOTSTRAP" -eq "1" ]; then
  # Create tables required by api
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/bootstrap.sql
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/default_workflow.sql
  if [ -n "$DB_BOOTSTRAP_FILE" ]; then
    PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
      -f /app/scripts/$DB_BOOTSTRAP_FILE
  fi
fi

if [ "$DB_SAMPLEDATA" -eq "1" ]; then
  # Add sample data for CI environment
  PGPASSWORD=$POSTGRES_PASSWORD runny psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
    -f /app/scripts/sample_data.sql
fi

# start api server
dotnet "OptimaJet.DWKit.StarterApplication.dll"
