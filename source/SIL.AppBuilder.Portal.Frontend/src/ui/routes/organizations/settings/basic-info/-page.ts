import {
  interactor,
  clickable,
  text,
  fillable,
  Interactor
} from '@bigtest/interactor';

class Page {
  fillName = fillable('input[data-test-name]');
  fillLogo = fillable('input[data-test-logo-url');
  submit = clickable('button[data-test-submit]');
}

export const PageInteractor = interactor(Page);

export type TPageinationInteractor = Page & Interactor;

export default new (PageInteractor as any)('form[data-test-org-settings-basic-info]') as TPageinationInteractor;
