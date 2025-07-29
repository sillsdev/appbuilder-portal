# AppBuilder Portal

[![Scriptoria v2 Tests](https://github.com/sillsdev/appbuilder-portal/actions/workflows/tests.yml/badge.svg?branch=feature%2Fsvelte)](https://github.com/sillsdev/appbuilder-portal/actions/workflows/tests.yml)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/scriptoria/localized.svg)](https://crowdin.com/project/scriptoria)

### Description

The `appbuilder-portal` is the portal frontend/backend for the Scriptoria project. This project provides software to automate the building and publishing of Scripture App Builder apps (and other related content) to App Stores and websites. It runs as a single docker container, requiring a database and redis (valkey) server.

This process requires the coordination of user activites, project data, automated services, and administrative activities (e.g. managing App Store listings). The portal provides organization, group, user, project, and product management and provides access to users and organizational admins to interact with the workflow activities.

This process also requires management of resources to store project data (AWS CodeCommit), generate product files from project data (AWS CodeBuild), and store product files for distribution (AWS S3). These resources are managed by an instance of [AppBuilder BuildEngine](https://github.com/sillsdev/appbuilder-buildengine-api).

# Development

### Prerequisites

- [Docker CE](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) ([Docker Desktop on Mac](https://docs.docker.com/docker-for-mac/install/))
- [Volta](https://volta.sh) - controls which version of node is used per directory

Common scripts are in the `run` file, so be sure to check that for reference.

## First-time setup

To get started, clone the repository.
You will need a /.env file with the following variables set. 
Contact [@sillsdev/scriptoria-developers](https://github.com/orgs/sillsdev/teams/scriptoria-developers/members) for help setting these up. 
```env
DATABASE_URL="postgresql://db-user:1234@localhost:5432/development?schema=public"
MAIL_SENDER=LogEmail
AUTH0_CLIENT_ID=n8IAE2O17FBrlQ667x5mydhpqelCBUWG
AUTH0_DOMAIN=sil-appbuilder.auth0.com
AUTH0_CONNECTION=Username-Password-Authentication
DEFAULT_BUILDENGINE_URL=http://stg-tunnel:8443

AUTH0_SECRET=
AUTH0_CLIENT_SECRET=
DEFAULT_BUILDENGINE_API_ACCESS_TOKEN=
EMAIL_FROM=
```

Next, run the following commands to setup your environment. 

```bash
npm i # Install dependencies
./run bootstrap # Bootstrap database and initalize docker support images (db adminer valkey)
ADD_USER=true npm run dev # Start the local dev server and create a user invite link
```

Visit [http://localhost:6173](http://localhost:6173) to see the homepage of the site, then click the invite link in the console to setup your admin account. 

## Running in Docker

```bash
./run up
```

Visit [http://localhost:6173](http://localhost:6173) to access the web application frontend.

Visit [http://localhost:18080](http://localhost:18080) to access the development database using [Adminer](https://adminer.org).

- System: PostgreSQL, Server: db, Username: db-user, Password: 1234, Database: development

Visit [http://localhost:6173/admin/jobs](http://localhost:6173/admin/jobs) to access the BullMQ tasks queues.

## Running in the Host OS

This is important for local development. You still need the `db` and `valkey` docker images running. 

Start database and adminer

```bash
./run up:local:start
```

Start SvelteKit project

```bash
npm run dev
# or
npm run build; NODE_ENV=development npm run preview
```

# Testing and linting

```bash
CI_EMAIL= CI_PASSWORD= npm run test
npm run lint
```

Currently tests check that the page comes online and that a user is able to login.
The `CI_EMAIL` and `CI_PASSWORD` environment variables are required to test login. 

# Deployment

### Building The Docker Images

```bash
./run build
```

# Production

### Database configuration

Before starting the docker container in production, make sure to deploy Prisma migrations using `npx prisma migrate deploy`. 

# Special Thanks

For authentication and authorization services:

[<img src="readme_images/auth0-logo-whitebg.png" width="200">](https://auth0.com)

For localization management:

[<img src="readme_images/crowdin-logo.png" width="200">](https://crowdin.com)

