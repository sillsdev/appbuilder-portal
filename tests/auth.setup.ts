import { encode } from '@auth/core/jwt';
import { expect, test as setup } from '@playwright/test';
import { join } from 'path';

const authFile = join(process.cwd(), './playwright/.auth/user.json');

setup('index page has expected h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Scriptoria' })).toBeVisible();
});
setup.describe('login setup', () => {
  setup('can login (full flow)', async ({ page }) => {
    const { CI_EMAIL, CI_PASSWORD } = process.env;
    setup.skip(!CI_EMAIL || !CI_PASSWORD, 'CI credentials not set. Simulating logged in user.');
    await page.goto('/');
    // Click the login button
    // Login and Login with new session
    await expect(page.getByRole('button', { name: 'Login' })).toHaveCount(2);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    // Wait for the login page to load
    await expect(page.getByPlaceholder('yours@example.com')).toBeVisible();
    // Fill in the email and password
    await page.getByPlaceholder('yours@example.com').fill(CI_EMAIL!);
    await page.getByPlaceholder('your password').fill(CI_PASSWORD!);
    // Click the login button
    await page.getByRole('button', { name: 'Log In' }).click();
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();

    await page.context().storageState({ path: authFile });
  });
  setup('setup login state', async ({ page }) => {
    const { CI_EMAIL, CI_PASSWORD } = process.env;
    setup.skip(!!CI_EMAIL && !!CI_PASSWORD, 'CI credentials set. Skipping simulated login.');
    const token = await encode({
      token: {
        // name: 'ci@scriptoria.io',
        // email: 'ci@scriptoria.io',
        picture: 'https://cdn.auth0.com/avatars/ci.png',
        // NOTE: this userId is correct in seed.ts but could be incorrect in personal dbs
        userId: 6,
        userImpersonating: false
      },
      secret: process.env.AUTH0_SECRET!,
      salt: 'authjs.session-token'
    });
    await page.context().addCookies([
      {
        name: 'authjs.session-token',
        value: token!,
        domain: 'localhost',
        path: '/',
        httpOnly: true
      }
    ]);
    // Reload the page to apply the cookie
    await page.goto('/');
    // Verify that we are logged in
    await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
    await page.context().storageState({ path: authFile });
  });
});
