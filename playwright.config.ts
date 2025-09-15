import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env' });
}

const config: PlaywrightTestConfig = {
  webServer: {
    // With more elaborate tests stg-tunnel could also be started
    // In CI, the docker compose stack should be started before the tests
    // and the web server should already be running
    command: process.env.CI
      ? 'sleep 1d'
      : 'npm run build && ./run dc up -d db valkey ; npm run preview',
    port: 6173,
    reuseExistingServer: true,
    env: {
      NODE_ENV: 'development'
    }
  },
  use: {
    baseURL: 'http://localhost:6173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
