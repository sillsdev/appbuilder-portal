import { interactor, clickable, fillable, isPresent } from '@bigtest/interactor';

@interactor
export class FormInteractor {
  constructor(selector?: string) {}

  fillName = fillable('[data-test-name]');
  fillEmail = fillable('[data-test-email]');
  fillSite = fillable('[data-test-site]');

  hasError = isPresent('[data-test-error-message]');

  clickSubmit = clickable('[data-test-submit]');
}

export default new FormInteractor('[data-test-form]');
