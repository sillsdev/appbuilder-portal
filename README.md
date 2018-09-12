# AppBuilder Portal

[![Build Status](https://travis-ci.org/sillsdev/appbuilder-portal.svg?branch=master)](https://travis-ci.org/sillsdev/appbuilder-portal)

## Deployment

### Building The Images
```
CURRENT_VERSION=$(git rev-parse HEAD)

# nginx
cd source && \
  docker build . -f Dockerfile.nginx \
    --tag "nginx-$CURRENT_VERSION" --target release

# api
cd source && \
  docker build . -f Dockerfile.backend \
    --tag "api-$CURRENT_VERSION" --target runtime-release

```

Running Locally:
```
docker run -p 8080:80 nginx-$CURRENT_VERSION
docker run -p 3000:7081 api-$CURRENT_VERSION
```

## Production

### Database configuration

DWKit requires database scripts to be executed before running the backend
 * `scripts/DB/PostgreSQL/DWKitScript.sql`
 * `scripts/DB/PostgreSQL/Workflow_CreatePersistenceObjects.sql`

These seem to be idempotent, but we do not have a guarantee that they will remain that way.

The backend has a Entity Framework Core migrations script generated into the production docker image (created by `source/Dockerfile.backend`) and is run at startup (by `source/run-api.sh`).  

If you need to rollback a production release that contains a new migration change, you can generate a rollback sql script by running the following command in the `source/OptimaJet.DWKit.StarterApplication` directory of the code current at production (that you wish to rollback):
```bash
dotnet ef migrations script --idempotent --output rollback.sql <FROM> <TO>
```
To get the `<FROM>` and `<TO>` values, run the following command in the same directory:
```bash
dotnet ef migrations list
```
For the `<FROM>` value, use the last migration.  For the `<TO>` value, use the last migration in the point in the history of migrations that you would like to rollback to.

## Development

Common scripts are in the `run` file, so be sure to check that for reference.

### Running

```bash
./run up:build

# first time only, after up:build, separate terminal
./run bootstrap
```

### Testing

```bash
./run yarn test
./run dotnet test
```

Test Debugging:
```bash
./run yarn test:watch:detached
```

[Now Visit http://localhost:9876/debug.html](http://localhost:9876/debug.html) to debug
the tests, and run them individually.

### Backend Notes

- All endpoints should be behind an `api/` path
- Access to Auth0 Management API requires configuation which should not be checked into source control
  - Values should be stored in `.env` (which is in `.gitignore`)
  - Login to http://manage.auth0.com
  - Navigate to `APIs` -> `Auth0 Management API` -> `Auth0 Management API (Test Application)`
  - Get `Client ID` and `Client Secret` values
  - assign to following variables in `.env`
    - `AUTH0_TOKEN_ACCESS_CLIENT_ID`
    - `AUTH0_TOKEN_ACCESS_CLIENT_SECRET`
- When configuring the `Machine to Machine Applications`, the scopes required are:
  - `read:users`
  - `read:users_app_metadata`
- Bugsnag is used to log exceptions
  - Add BUGSNAG_API_KEY to `.env`

### Frontend Notes

DWKitForm requires
- react-data-grid-addons
- semantic-ui-react
- jquery

TODO:
- see if jQuery can be removed (~85KB)
- see if optimajet-form can be smaller (~569KB)
