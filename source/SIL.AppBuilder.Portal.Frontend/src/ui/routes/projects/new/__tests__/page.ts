import { interactor, clickable, isPresent, fillable, text } from '@bigtest/interactor';
import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import applicationTypeInteractor from '@ui/components/inputs/application-type-select/__tests__/page';
import languageInteractor from '@ui/components/inputs/locale-input/-page';

@interactor
export class CreateProjectInteractor {
  constructor(selector?: string) {}

  isSaveDisabled = isPresent('[data-test-save].disabled');

  noAvailableGroupsText = text('[data-test-no-available-groups]');

  fillName = fillable('[data-test-name]');
  fillLanguage = fillable('[data-test-language]');
  toggleVisibility = clickable('[data-test-visibility] input');

  isVisibilityChecked = isPresent('[data-test-visibility].checked');

  language = languageInteractor;
  groupSelect = groupInteractor;
  applicationTypeSelect = applicationTypeInteractor;
}

export default new CreateProjectInteractor('[data-test-new-project-form]');
