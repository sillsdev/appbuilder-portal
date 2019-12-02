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
class UserTableUserRoleInteractor extends Interactor {
  open = isPresent('[data-test-role-menu].visible');
  isOpen = isPresent('[data-test-role-menu].visible');
  list = text('[data-test-role-no-edit] > div');
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
export class UserTableInteractor {
  static defaultScope = '[data-test-userstable]';
  constructor() {}

  clickLockUser = clickable('[data-test-toggle-lock]:first-child');
  isUserActive = hasClass('[data-test-toggle-lock]:first-child', 'checked');
  usernames = collection('[data-test-user-table-username]');

  groupDropdowns = collection('[data-test-group-multi-select]');
  groupDropdownCheckboxes = collection('[data-test-multi-group-checkbox]');
  groupDropdownText = text('[data-test-group-no-edit] > div');
  groupDropdownOrganizationName = collection('[data-test-organization-name]');

  row = collection('[data-test-user-row]', {
    isActive: hasClass('[data-test-toggle-lock]', 'checked'),
    toggleActive: clickable('[data-test-toggle-lock] input'),

    activeGroupsText: text('[data-test-groups-active]'),
    activeGroups: collection('[data-test-groups-active]', {
      text: text(),
    }),
    groupOrganizations: collection('[data-test-organization-name]', {
      text: text(),
    }),
    groupOrganizationsText: text('[data-test-organization-name]'),

    role: scoped('[data-test-role-selector]', UserTableUserRoleInteractor),
  });

  async toggleRoleAt(index: number, role: string, organization: string) {
    // NOTE: the dropdown doesn't actually need to be open, because the UI
    // is all rendered.
    // also, for some reason, I (Preston) can't figure out how to programatically
    // open the role dropdown. :-\
    await this.row(index).role.chooseUnder(role, organization);
  }

  containsUserByEmail(email: string): boolean {
    return this.scoped(`[data-test-user-row='${email}']`).isPresent;
  }
}

export default UserTableInteractor;
