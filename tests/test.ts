import { expect, test } from '@playwright/test';

test('auth shared to tests', async ({ page }) => {
  await page.goto('/'); // should redirect to /tasks
  // Wait for the page to load
  await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
});
test('can send email', async ({ page }) => {
  // go to user invite page
  await page.goto('/users/invite');
  await expect(page.getByRole('button', { name: 'Send Invite' })).toBeVisible();
  // fill in data
  // 1. email address
  await page.getByPlaceholder('user@example.com').fill('success@simulator.amazonses.com');
  // 2. organization
  await page.getByRole('combobox', { name: 'Organization' }).selectOption('SIL International');
  // 3. roles
  await page.getByLabel('Author').check();
  // 4. groups
  await page.getByLabel('Language Software Development').check();
  // 5. submit
  await page.getByRole('button', { name: 'Send Invite' }).click();
  // go to users
  await expect(page.getByRole('heading', { name: 'Manage Users' })).toBeVisible();
  // TODO: how to test that email was successfully sent???
});
