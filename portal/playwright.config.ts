import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    // With more elaborate tests stg-tunnel could also be started
    command: 'npm run build && (cd .. ; ./run dc up -d db valkey) ; npm run preview',
    port: 6173,
    reuseExistingServer: !process.env.CI,
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
