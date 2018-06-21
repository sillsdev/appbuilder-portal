import "regenerator-runtime/runtime";

import * as express from 'express';
import * as proxy from 'http-proxy-middleware';
const Bundler = require('parcel-bundler');

const port = Number(process.env.PORT || 1234);
const hmrPort = Number(process.env.HMR_PORT || 0);

const bundler = new Bundler('src/index.html', {
  cache: false,
  hmrPort,
  logLevel: 2
});

const app = express();
const httpProxy = proxy({
  changeOrigin: true,
  secure: false,
  target: `http://${process.env.API_HOST}`,
  ws: true,
});

// everything *should* have an api route
// TODO: backend may need updating
app.use('/api', httpProxy);

// for testing successful request to backend (for now)
// TODO: remove
app.use('/configapi', httpProxy);
app.use('/ui', httpProxy);

app.use(bundler.middleware());

app.listen(port, '0.0.0.0', () => {
  // tslint:disable-next-line:no-console
  console.log(`Listening on 0.0.0.0:${port}, and HMRing on port ${hmrPort}`);
});
