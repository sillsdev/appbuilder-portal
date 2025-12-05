import { type Page, expect, test } from '@playwright/test';

test('auth shared to tests', async ({ page }) => {
  await page.goto('/'); // should redirect to /tasks
  // Wait for the page to load
  await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
});
test.describe('Create a Test Project', () => {
  // skip tests if earlier one fails
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  let projectName: string;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    projectName = `CI Test Project ${new Date().toLocaleString('en-US')}`;
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Go to New Projects', async () => {
    // go to new projects page
    await page.goto('/projects/new/1'); // this will set $orgActive to 1
    await expect(page.getByRole('heading', { name: 'New Project' })).toBeVisible();
  });

  test('LanguageCodeTypeahead', async () => {
    // type 'eng' into LanguageCodeTypeahead
    const typeaheadInput = page.getByPlaceholder('Language Code');
    await expect(typeaheadInput).toBeVisible();
    // wait a small amount of time for event handlers to be added to typeaheadInput
    await page.waitForTimeout(200);
    await typeaheadInput.focus();
    await expect(typeaheadInput).toBeFocused();
    await typeaheadInput.fill('eng');
    await expect(typeaheadInput).toHaveValue(/^eng$/);
    // look for result with tag 'en'
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
    await page.getByLabel('Project Name').fill(projectName);
    // submit button should no longer be disabled
    await expect(submit).toBeEnabled();
  });

  test('Create Project', async () => {
    // submit button should be enabled at this point
    const submit = page.getByRole('button', { name: 'Save' });
    await expect(submit).toBeEnabled();
    // get project name and assert that it matches expecations
    await expect(page.getByLabel('Project Name')).toHaveValue(projectName);
    // submit project (should redirect to project page)
    await submit.click();
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
    const id = parseInt(page.url().split('/').at(-1)!);
    console.log(`Created Project: Id = ${id}, Name = ${projectName}`);
  });

  test('Archive Project (Test SSE)', async ({ context }) => {
    // make sure we're on the same page
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
    // open a separate tab
    const alt = await context.newPage();
    await alt.goto(page.url());
    await expect(alt.getByRole('heading', { name: projectName })).toBeVisible();
    // find action menu and archive project
    const actMenu = page
      .getByRole('group')
      .filter({ hasText: /(Archive|Reactivate)/ })
      .first();
    await actMenu.click();
    const archive = actMenu.getByText('Archive');
    await expect(archive).toBeVisible();
    await archive.click();
    await expect(actMenu.getByText('Reactivate')).toBeVisible();
    await expect(archive).toBeHidden();
    // test that change was made on alternate page
    const act2 = alt
      .getByRole('group')
      .filter({ hasText: /(Archive|Reactivate)/ })
      .first();
    await act2.click();
    await expect(act2.getByText('Archive')).toBeHidden();
    await expect(act2.getByText('Reactivate')).toBeVisible();
    await alt.close();
  });

  // TODO: test BuildEngine stuff
});

// see issue #1368
test.describe('No admin perms in other org', () => {
  // skip tests if earlier one fails
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('Select Org', async () => {
    await page.goto('/');
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
    const orgSelector = page
      .getByRole('complementary')
      .getByRole('button', { name: /(SIL International|Kalaam Media|All Organizations)/ });
    await expect(orgSelector).toBeVisible();
    // $orgActive is set to 1 by Create a Test Project, switch just in case
    if (!(await orgSelector.textContent())?.match(/SIL International/)) {
      await orgSelector.click();
      const button = page.getByRole('button', { name: 'SIL International' });
      await expect(button).toBeVisible();
      await button.click();
    }

    await expect(orgSelector).toContainText('SIL International');
  });
});
