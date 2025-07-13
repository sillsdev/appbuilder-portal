import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run build && (cd .. ; ./run up -d) && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'development'
    }
  },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry'
  },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
