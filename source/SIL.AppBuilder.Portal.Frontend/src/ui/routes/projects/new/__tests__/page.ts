import {
  interactor,
  clickable,
  text,
  selectable,
  isPresent,
  fillable,
  is
} from '@bigtest/interactor';


import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';

@interactor
export class CreateProjectInteractor {
  constructor(selector?: string) { }

  isSaveDisabled = isPresent('[data-test-save].disabled');

  fillName = fillable('[data-test-name]');
  fillLanguage = fillable('[data-test-language]');
  fillType = fillable('[data-test-type]');
  toggleVisibility = clickable('[data-test-visibility]');

  isVisibilityChecked = isPresent('[data-test-visibility].checked');

  groupSelect = groupInteractor;
}

export default new CreateProjectInteractor('[data-test-new-project-form]');
