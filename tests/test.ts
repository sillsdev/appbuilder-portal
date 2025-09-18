import { expect, test } from '@playwright/test';

test('auth shared to tests', async ({ page }) => {
  await page.goto('/'); // should redirect to /tasks
  // Wait for the page to load
  await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
});
test('test LanguageCodeTypeahead', async ({ page }) => {
  // go to new projects page
  await page.goto('/projects/new/1');
  await expect(page.getByRole('heading', { name: 'New Project' })).toBeVisible();
  // type 'eng' into LanguageCodeTypeahead
  const typeaheadInput = page.getByPlaceholder('Language Code');
  await expect(typeaheadInput).toBeVisible();
  await typeaheadInput.focus();
  await expect(typeaheadInput).toBeFocused();
  await typeaheadInput.fill('eng');
  await expect(typeaheadInput).toHaveValue('eng');
  // look for result with tag 'en'
  // Note: for some reason, this only works when not reusing an existing server
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  const option = list.getByRole('option', { name: 'English en Code' });
  await expect(option).toBeVisible();
});
});
