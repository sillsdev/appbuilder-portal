
import {
  interactor, isPresent,
  clickable, value,
} from '@bigtest/interactor';

@interactor
export class UserInteractor {
  constructor(selector?: string) { }

  clickLockUser = clickable('[data-test-toggle-lock]:first');

  unlockUser = isPresent('[data-test-toggle-lock]:first.checked');

}

export default new UserInteractor('[data-test-edit-profile]');
