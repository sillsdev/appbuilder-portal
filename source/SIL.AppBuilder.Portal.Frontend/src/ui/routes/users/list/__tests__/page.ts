
import {
  interactor, hasClass,
  clickable, collection, text, scoped, isPresent
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

  row = collection('[data-test-user-row]', {
    role: scoped('[data-test-role-selector]', {
      open: clickable('[data-test-role-multi-select]'),
      isOpen: isPresent('[data-test-role-menu].visible'),
      list: text('[data-test-role-multi-select] > div.text'),
      organizationNames: text('[data-test-organization-name]'),
      noEditText: text('[data-test-role-no-edit]'),

      chooseUnder(role: string, organization: string) {
        return (
          this
            .when(() => {
              const org = this
                .$$('[data-test-organization-name]')
                .find(item => item
                      .innerText.toLowerCase()
                      .includes(organization.toLowerCase()));

              if (!org) {
                throw new Error(`cannot find organization named ${organization}`);
              }

              const nameElements = org
                .parentElement
                .querySelectorAll('[data-test-organization-name]');

              const formField = Array.from(nameElements)
                .map(item => item.parentElement.querySelectorAll(`[data-test-role-select] input`))
                .map(elements => Array.from(elements))
                .flat()
                .find(item => item.value.toLowerCase().includes(role.toLowerCase()));

              if (!formField) {
                throw new Error(`could not find role ${role} under organization ${organization}`);
              }


              return formField;
           }).do(el => el.click())
        );
      },
    }),
  });
}

export default new UserInteractor('[data-test-users]');
