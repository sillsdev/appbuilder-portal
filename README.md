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


### Frontend Notes

DWKitForm requires
- react-data-grid-addons
- semantic-ui-react
- jquery

TODO:
- see if jQuery can be removed (~85KB)
- see if optimajet-form can be smaller (~569KB)
