import { expect, test as setup } from '@playwright/test';
import { join } from 'path';

const authFile = join(process.cwd(), './playwright/.auth/user.json');

setup('index page has expected h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Scriptoria' })).toBeVisible();
});
setup('can login', async ({ page }) => {
  const { CI_EMAIL, CI_PASSWORD } = process.env;
  expect(CI_EMAIL).toBeTruthy();
  expect(CI_PASSWORD).toBeTruthy();
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
