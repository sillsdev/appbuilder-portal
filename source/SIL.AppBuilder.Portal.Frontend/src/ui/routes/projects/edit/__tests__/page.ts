import { Input } from 'semantic-ui-react';
import { interactor, clickable, isPresent, fillable, value } from '@bigtest/interactor';
import languageInteractor from '@ui/components/inputs/locale-input/-page';

@interactor
export class EditProjectInteractor {
  constructor(selector?: string) {}
  language = languageInteractor;

  isSaveDisabled = isPresent('[data-test-save].disabled');

  fillName = fillable('[data-test-name]');
  fillDescription = fillable('[data-test-description]');
  fillLanguage = fillable('data-test-language');

  textName = value('[data-test-name]');
  textDescription = value('[data-test-description]');

  clickSave = clickable('[data-test-save]');
  clickCancel = clickable('[data-test-cancel]');
}

export default new EditProjectInteractor('[data-test-edit-project-form]');
