// tslint:disable:max-classes-per-file
import {
  interactor,
  Interactor,
  hasClass,
  clickable,
  collection,
  text,
  scoped,
  isPresent,
} from '@bigtest/interactor';

@interactor
class UserTalbeUserRoleInteractor extends Interactor {
  open = clickable('[data-test-role-multi-select]');
  isOpen = isPresent('[data-test-role-menu].visible');
  list = text('[data-test-role-multi-select] > div');
  organizationNames = text('[data-test-organization-name]');
  noEditText = text('[data-test-role-no-edit]');
  chooseUnder(role: string, organization: string) {
    return this.when(() => {
      const org = this.$$('[data-test-organization-name]').find((item) =>
        item.innerText.toLowerCase().includes(organization.toLowerCase())
      );

      if (!org) {
        throw new Error(`cannot find organization named ${organization}`);
      }

      const nameElements = org.parentElement.querySelectorAll('[data-test-organization-name]');

      const formField = Array.from(nameElements)
        .map((item) => item.parentElement.querySelectorAll(`[data-test-role-select] input`))
        .map((elements) => Array.from(elements))
        .flat()
        .find((item: Element) => item.value.toLowerCase().includes(role.toLowerCase()));

      if (!formField) {
        throw new Error(`could not find role ${role} under organization ${organization}`);
      }

      return formField;
    }).do((el) => el.click());
  }
}

@interactor
class UserTableRowInteractor {
  constructor(selector?: string) {}
  role = scoped('[data-test-role-selector]', UserTalbeUserRoleInteractor);
}

@interactor
export class UserTableInteractor {
  static defaultScope = '[data-test-userstable]';
  constructor(selector?: string) {}

  clickLockUser = clickable('[data-test-toggle-lock]:first-child');
  isUserActive = hasClass('[data-test-toggle-lock]:first-child', 'checked');
  usernames = collection('[data-test-user-table-username]');

  groupDropdowns = collection('[data-test-group-multi-select]');
  groupDropdownCheckboxes = collection('[data-test-multi-group-checkbox]');
  groupDropdownText = text('[data-test-group-multi-select] > div');
  groupDropdownOrganizationName = collection('[data-test-group-multi-organization-name]');

  row = collection('[data-test-user-row]', {
    isActive: hasClass('[data-test-toggle-lock]', 'checked'),

    activeGroupsText: text('[data-test-groups-active]'),
    activeGroups: collection('[data-test-groups-active]', {
      text: text(),
    }),

    role: scoped('[data-test-role-selector]', UserTalbeUserRoleInteractor),
  });

  containsUserByEmail(email: string): boolean {
    return this.scoped(`[data-test-user-row='${email}']`).isPresent;
  }
}

export default UserTableInteractor;
