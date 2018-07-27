# AppBuilder Portal

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
./run yarn test:watch:headless
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

### Frontend Notes

DWKitForm requires
- react-data-grid-addons
- semantic-ui-react
- jquery

TODO:
- see if jQuery can be removed (~85KB)
- see if optimajet-form can be smaller (~569KB)
