import {
  interactor,
  clickable,
  text,
  selectable,
  isPresent
} from '@bigtest/interactor';

@interactor
export class CreateProjectInteractor {
  constructor(selector?: string) { }

  isSaveDisabled = isPresent('[data-test-save].disabled');

}

export default new CreateProjectInteractor('[data-test-new-project-form]');
