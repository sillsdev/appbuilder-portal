import { type Page, expect, test } from '@playwright/test';

test('auth shared to tests', async ({ page }) => {
  await page.goto('/'); // should redirect to /tasks
  // Wait for the page to load
  await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
});
test.describe('Create a Test Project', () => {
  //test.describe.configure({ mode: 'serial' });
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('Go to New Projects', async () => {
    // go to new projects page
    await page.goto('/projects/new/1');
    await expect(page.getByRole('heading', { name: 'New Project' })).toBeVisible();
  });

  test('LanguageCodeTypeahead', async () => {
    // type 'eng' into LanguageCodeTypeahead
    const typeaheadInput = page.getByPlaceholder('Language Code');
    await expect(typeaheadInput).toBeVisible();
    await typeaheadInput.focus();
    await expect(typeaheadInput).toBeFocused();
    await typeaheadInput.fill('eng');
    await expect(typeaheadInput).toHaveValue(/^eng$/);
    // look for result with tag 'en'
    // Note: for some reason, this only works when not reusing an existing server
    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    const option = list.getByRole('option', { name: 'English en Code' });
    await expect(option).toBeVisible();
    // selecting option should hide it
    await option.click();
    await expect(option).toBeHidden();
    // selecting option should change language code to just be en
    await expect(typeaheadInput).toHaveValue(/^en$/);
  });

  test('Other fields', async () => {
    // submit button should be disabled until name is filled
    const submit = page.getByRole('button', { name: 'Save' });
    await expect(submit).toBeDisabled();
    // project group should be LSDEV
    await page
      .getByRole('combobox', { name: 'Project Group' })
      .selectOption('Language Software Development');
    // project type should already be SAB
    await page.getByRole('combobox', { name: 'Type' }).selectOption('Scripture App Builder');
    // fill project name
    const name = page.getByLabel('Project Name');
    await name.fill(`CI Test Project ${new Date().toLocaleString('en-US')}`);
    // submit button should no longer be disabled
    await expect(submit).toBeEnabled();
  });

  test('Create Project', async () => {
    // submit button should be enabled at this point
    const submit = page.getByRole('button', { name: 'Save' });
    await expect(submit).toBeEnabled();
    // get project name and assert that it matches expecations
    const name = await page.getByLabel('Project Name').inputValue();
    expect(name).toContain('CI Test Project');
    // submit project (should redirect to project page)
    await submit.click();
    await expect(page.getByRole('heading', { name })).toBeVisible();
  });

  // TODO: test BuildEngine stuff
});
});
