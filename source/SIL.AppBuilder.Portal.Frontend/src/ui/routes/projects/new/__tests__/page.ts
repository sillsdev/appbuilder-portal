import {
  interactor,
  clickable,
  isPresent,
  fillable
} from '@bigtest/interactor';


import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import applicationTypeInteractor from '@ui/components/inputs/application-type-select/__tests__/page';

@interactor
export class CreateProjectInteractor {
  constructor(selector?: string) { }

  isSaveDisabled = isPresent('[data-test-save].disabled');

  fillName = fillable('[data-test-name]');
  fillLanguage = fillable('[data-test-language]');
  toggleVisibility = clickable('[data-test-visibility]');

  isVisibilityChecked = isPresent('[data-test-visibility].checked');

  groupSelect = groupInteractor;
  applicationTypeSelect = applicationTypeInteractor;
}

export default new CreateProjectInteractor('[data-test-new-project-form]');
