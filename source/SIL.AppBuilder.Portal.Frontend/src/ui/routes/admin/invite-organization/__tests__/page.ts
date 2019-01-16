import { interactor, clickable, fillable, value } from '@bigtest/interactor';

@interactor
export class FormInteractor {
  constructor(selector?: string) {}

  fillEmail = fillable('[data-test-owner-email]');
  fillOrgName = fillable('[data-test-org-name]');
  clickSubmit = clickable('[data-test-submit]');

  email = value('[data-test-owner-email]');
  orgName = value('[data-test-org-name]');
}

export default new FormInteractor('[data-test-form]');
