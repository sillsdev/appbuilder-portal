# AppBuilder Portal

[![Build Status](https://travis-ci.org/sillsdev/appbuilder-portal.svg?branch=master)](https://travis-ci.org/sillsdev/appbuilder-portal)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/scriptoria/localized.svg)](https://crowdin.com/project/scriptoria)
[![Maintainability](https://api.codeclimate.com/v1/badges/71fa3c1c0bf8eca409d2/maintainability)](https://codeclimate.com/github/sillsdev/appbuilder-portal/maintainability)

### Description

The `appbuilder-portal` is the portal frontend/backend for the Scriptoria project. This project provides software to automate the building and publishing of apps (and other related content) to App Stores and websites. It runs as a pair of docker containers.

This process requires the coordination of user activites, project data, automated services, and administrative activities (e.g. managing App Store listings). The process is defined and managed by a [DW KIT](https://dwkit.com) Workflow instance. The portal provides organization, group, user, project, and product management and provides access to users and organizational admins to interact with the workflow activities.

This process also requires management of resources to store project data (AWS CodeCommit), generate product files from project data (AWS CodeBuild), and store product files for distribution (AWS S3). These resources are managed by an instance of [AppBuilder BuildEngine](https://github.com/sillsdev/appbuilder-buildengine-api).

# Development

### Prerequisites

- [Docker CE](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) ([Docker Desktop on Mac](https://docs.docker.com/docker-for-mac/install/))
- Bash (Note: On macOS, for `run clean:frontend` to work correctly, install bash from [homebrew](https://brew.sh)).
- [Volta](https://volta.sh) - controls which version of node/yarn is used per directory

Common scripts are in the `run` file, so be sure to check that for reference.

## Running in Docker

```bash
./run up:build

# first time only, after up:build, separate terminal
./run bootstrap
```

Visit [http://localhost:9091/tasks](http://localhost:9091) to access the web application frontend. [Note: You will need to modify the default user database. Contact [@sillsdev/scriptoria-developers](https://github.com/orgs/sillsdev/teams/scriptoria-developers/members) after your first login attempt to get your auth0Id to use in the database.]

Visit [http://locahost:7081/Account/Login](http://locahost:7081/Account/Login) to access the backend DWKit admin panel (contact [@sillsdev/scriptoria-developers](https://github.com/orgs/sillsdev/teams/scriptoria-developers/members) for the default username/password).

Visit [http://localhost:18080](http://localhost:18080) to access the development database using [Adminer](https://adminer.org).

- System: PostgreSQL, Server: db, Username: db-user, Password: 1234, Database: development

Visit [http://locahost:7081/hangfire](http://locahost:7081/hangfire) to access the hangfire background processing dashboard.

## Running in the Host OS

This is useful if you want to debug C# backend in Visual Studio. You will still run the database in Docker. You will need to run the full setup once in Docker to do the bootstrap process.

Update /etc/hosts

```
127.0.0.1	db.docker
127.0.0.1	api
127.0.0.1	adminer
```

Start database and adminer

```bash
./run up:local:start
```

Start backend in Visual Studio or terminal

```bash
cd source/OptimaJet.DWKit.StarterApplication
dotnet watch run
```

Start frontend

```bash
# If you have switched branches, it is good to clean the cache first
./run yarn cache clean

./run yarn && ./run yarn start:dev
```

Visit urls listed above.

# Testing

```bash
./run yarn cache clean && ./run yarn && ./run yarn test
./run dotnet test
```

Test Debugging:

```bash
./run yarn test:watch:detached
```

[Now Visit http://localhost:9876/debug.html](http://localhost:9876/debug.html) to debug
the tests, and run them individually.

# Deployment

### Building The Images

```
CURRENT_VERSION=$(git rev-parse HEAD)

# nginx
  docker build . -f Dockerfile.nginx \
    --tag "nginx-$CURRENT_VERSION" --target release

# api
  docker build . -f Dockerfile.backend \
    --tag "api-$CURRENT_VERSION" --target runtime-release

```

Running Locally:

```
docker run -p 8080:80 nginx-$CURRENT_VERSION
docker run -p 3000:7081 api-$CURRENT_VERSION


# to connect to an api container running from docker-compose
# get the container id from
docker ls

docker run -it \
    -p 9091:80 \
    -e "API_URL=http://api.docker:7081" \
    -e "AUTH0_DOMAIN=sil-appbuilder.auth0.com" \
    -e "AUTH0_CLIENT_ID=n8IAE2O17FBrlQ667x5mydhpqelCBUWG" \
    -e "DWKIT_UI_HOST=172.18.0.1" \
    --network appbuilder-portal_default \
    --link appbuilder-portal_api_1:api.docker nginx-$CURRENT_VERSION
```

# Production

### Database configuration

DWKit requires database scripts to be executed before running the backend

- `scripts/DB/PostgreSQL/DWKitScript.sql`
- `scripts/DB/PostgreSQL/Workflow_CreatePersistenceObjects.sql`

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

For the `<FROM>` value, use the last migration. For the `<TO>` value, use the last migration in the point in the history of migrations that you would like to rollback to.

### Backend Notes

- All endpoints should be behind an `api/` path
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

# Special Thanks

For authentication and authorization services:

[<img src="readme_images/auth0-logo-whitebg.png" width="200">](https://auth0.com)

For error reporting:

[<img src="readme_images/bugsnag-logo.png" width="200">](https://bugsnag.com/blog/bugsnag-loves-open-source)

For localization management:

[<img src="readme_images/crowdin-logo.png" width="200">](https://crowdin.com)

