import { interactor, clickable, fillable, value } from '@bigtest/interactor';

@interactor
export class FormInteractor {
  constructor(selector?: string) {}

  fillWebsite = fillable('[data-test-website]');
  fillOrgName = fillable('[data-test-org-name]');
  clickSubmit = clickable('[data-test-submit]');

  website = value('[data-test-website]');
  orgName = value('[data-test-org-name]');
}

export default new FormInteractor('[data-test-org-create-form]');
