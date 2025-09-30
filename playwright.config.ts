import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';

if (!process.env.CI_EMAIL) {
  dotenv.config({ path: '.env' });
  if (!process.env.CI_EMAIL) {
    console.warn('CI user credentials missing from env');
    console.log(process.env);
  }
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
  outputDir: 'playwright/test-results',
  projects: [
    // Setup Project
    { name: 'setup', testMatch: /.*\.setup.ts/ },
    {
      name: 'scriptoria',
      use: { storageState: 'playwright/.auth/user.json' },
      testMatch: /(.+\.)?(test|spec)\.[jt]s/,
      dependencies: ['setup']
    }
  ],
  expect: {
    timeout: 15_000 // 15s
  },
  retries: process.env.CI ? 2 : 0
};

export default config;
