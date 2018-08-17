import {
  interactor,
  text,
  clickable,
  findAll,
  isPresent,
} from '@bigtest/interactor';

@interactor
export class OrgSwitcherInteractor {
  constructor(selector?: string) {}


  orgNames = findAll('[data-test-org-select-item]');
  selectOrg = clickable('[data-test-org-select-item]');

  isSearchVisible = isPresent('[data-test-org-switcher-search]');

}

export default new OrgSwitcherInteractor('[data-test-org-switcher]');
