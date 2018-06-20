const proxy = require('http-proxy-middleware')
const Bundler = require('parcel-bundler')
const express = require('express')

const port = Number(process.env.PORT || 1234);
const hmrPort = Number(process.env.HMR_PORT || 0);

const bundler = new Bundler('src/index.html', {
  cache: false,
  logLevel: 2,
  hmrPort: hmrPort
});

const app = express();
const httpProxy = proxy({
  ws: true,
  secure: false,
  changeOrigin: true,
  target: `http://${process.env.API_HOST}`,
  autoinstall: false,
  publicUrl: 'dist/public/'
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
  console.log(`Listening on 0.0.0.0:${port}, and HMRing on port ${hmrPort}`);
});
