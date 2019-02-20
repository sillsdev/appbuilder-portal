# AppBuilder Portal
[![Build Status](https://travis-ci.org/sillsdev/appbuilder-portal.svg?branch=master)](https://travis-ci.org/sillsdev/appbuilder-portal)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/scriptoria/localized.svg)](https://crowdin.com/project/scriptoria)
[![Maintainability](https://api.codeclimate.com/v1/badges/71fa3c1c0bf8eca409d2/maintainability)](https://codeclimate.com/github/sillsdev/appbuilder-portal/maintainability)

## Description
The `appbuilder-portal` is the portal frontend/backend for the Scriptoria project.  This project provides software to automate the building and publishing of apps (and other related content) to App Stores and websites.

This process requires the coordination of user activites, project data, automated services, and administrative activities (e.g. managing App Store listings).  The process is defined and managed by a [DW KIT](https://dwkit.com) Workflow instance.  The portal provides organization, group, user, project, and product management and provides access to users and organizational admins to interact with the workflow activities.

This process also requires management of resources to store project data (AWS CodeCommit), generate product files from project data (AWS CodeBuild), and store product files for distribution (AWS S3).  These resources are managed by an instance of [AppBuilder BuildEngine](https://github.com/sillsdev/appbuilder-buildengine-api).

## Special Thanks

For authentication and authorization services:

[<img src="readme_images/auth0-logo-whitebg.png" width="200">](https://auth0.com)

For localization management:

[<img src="readme_images/crowdin-logo.png" width="200">](https://crowdin.com)

For error reporting:

[<img src="readme_images/bugsnag-logo.png" width="200">](https://bugsnag.com/blog/bugsnag-loves-open-source)

For email notification delivery:

[<img src="readme_images/sparkpost-logo.png" width="200">](https://www.sparkpost.com/)


## Deployment

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
    --network appbuilder-portal_default \
    --link 93a93b14287a:api.docker nginx-$CURRENT_VERSION
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
./run refresh-languages
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
