
import {
  interactor, hasClass,
  clickable, collection
} from '@bigtest/interactor';

@interactor
export class UserInteractor {
  constructor(selector?: string) { }

  clickLockUser = clickable('[data-test-toggle-lock]:first-child');
  isUserActive = hasClass('[data-test-toggle-lock]:first-child','checked');
  usernames = collection('[data-test-user-table-username]');
}

export default new UserInteractor('[data-test-users]');
