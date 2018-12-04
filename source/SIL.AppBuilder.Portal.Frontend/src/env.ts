// requires a babel transform during build
// https://github.com/babel/minify/tree/master/packages/babel-plugin-transform-inline-environment-variables
//
// NOTE: process.env cannot be dumped to a variable in order
//       for the transform to work.
//       process.env.{varname} must be used for each entry.
//
// see .babelrc for whitelisting what environment variables are
// allowed to be transformed
export const auth0 = {
  connection: process.env.AUTH0_CONNECTION,
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  scope: process.env.AUTH0_SCOPE,
};

export const NODE_ENV = process.env.NODE_ENV;
export const isTesting = process.env.IS_TESTING;
export const isDevelopment = NODE_ENV === 'development' || !NODE_ENV;

export const api = {
  host: process.env.API_HOST,
};

export const app = {
  hasApi: process.env.HAS_API
};
