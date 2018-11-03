
import {
  interactor, hasClass,
  clickable, collection, text
} from '@bigtest/interactor';

@interactor
export class UserInteractor {
  constructor(selector?: string) { }

  clickLockUser = clickable('[data-test-toggle-lock]:first-child');
  isUserActive = hasClass('[data-test-toggle-lock]:first-child','checked');
  usernames = collection('[data-test-user-table-username]');

  groupDropdowns = collection('[data-test-group-multi-select]');
  groupDropdownCheckboxes = collection('[data-test-multi-group-checkbox]');
  groupDropdownText = text('[data-test-group-multi-select] > div');
  groupDropdownOrganizationName = collection('[data-test-group-multi-organization-name]');

  roleDropdowns = collection('[data-test-role-multi-select]');
  roleDropdownCheckboxes = collection('[data-test-multi-role-checkbox]');
  roleDropdownText = text('[data-test-role-multi-select] > div');
  roleDropdownOrganizationName = collection('[data-test-role-multi-organization-name]');
}

export default new UserInteractor('[data-test-users]');
