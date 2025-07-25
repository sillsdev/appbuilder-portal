import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    // With more elaborate tests stg-tunnel could also be started
    // In CI, the docker compose stack should be started before the tests
    // and the web server should already be running
    command: process.env.CI
      ? 'sleep 1d'
      : 'npm run build && (cd .. ; ./run dc up -d db valkey) ; npm run preview',
    port: 6173,
    reuseExistingServer: true,
    env: {
      NODE_ENV: 'development'
    }
  },
  use: {
    baseURL: 'http://localhost:6173',
    trace: 'on-first-retry'
  },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
