import {
  clickable,
  scoped,
  isPresent,
  text,
  collection,
  interactor,
  Interactor,
} from '@bigtest/interactor';

class RoleTabModalInteractor {
  static defaultScope = '[data-test-role-tab]';
  constructor() {}

  orgRoles = collection('[data-test-roles-active]', {
    text: text(),
    roleOrganizationText: text('[data-test-organization-name]'),
    roleEntries: collection('[data-test-role-entry]', {
      text: text(),
      roleSelect: scoped('[data-test-role-select]'),
      toggleRoleSelect: clickable('[data-test-role-select]'),
      isChecked: isPresent('[data-test-role-select].checked'),
    }),
    roleList: scoped('[data-test-roles-list]'),
  });
}
export type TRoleTabModalInteractor = typeof RoleTabModalInteractor & Interactor;
const i: TRoleTabModalInteractor = interactor(RoleTabModalInteractor);

export default i as TRoleTabModalInteractor;
