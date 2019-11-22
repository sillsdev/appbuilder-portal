import {
  clickable,
  isPresent,
  scoped,
  text,
  collection,
  interactor,
  Interactor,
} from '@bigtest/interactor';

class GroupTabModalInteractor {
  static defaultScope = '[data-test-group-tab]';
  constructor() {}

  orgGroups = collection('[data-test-groups-active]', {
    text: text(),
    groupOrganizationText: text('[data-test-groups-organization-name]'),
    groupEntries: collection('[data-test-group-entry', {
      text: text(),
      toggleGroupMember: clickable('[data-test-multi-group-checkbox]'),
      isChecked: isPresent('[data-test-multi-group-checkbox].checked'),
      groupMember: scoped('[data-test-multi-group-checkbox]'),
    }),
  });
}
export type TGroupTabModalInteractor = typeof GroupTabModalInteractor & Interactor;
const i: TGroupTabModalInteractor = interactor(GroupTabModalInteractor);

export default i as TGroupTabModalInteractor;
