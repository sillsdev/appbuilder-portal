
import {
  interactor, hasClass,
  clickable, collection
} from '@bigtest/interactor';

import MultiGroupSelectInteractor from '@ui/components/inputs/multi-group-select/__tests__/page';

@interactor
export class UserInteractor {
  constructor(selector?: string) { }

  clickLockUser = clickable('[data-test-toggle-lock]:first-child');
  isUserActive = hasClass('[data-test-toggle-lock]:first-child','checked');
  usernames = collection('[data-test-user-table-username]');

  groupSelect = MultiGroupSelectInteractor;
}

export default new UserInteractor('[data-test-users]');
