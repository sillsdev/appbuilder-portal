import {
  interactor,
  text,
  clickable,
  findAll
} from '@bigtest/interactor';

@interactor
export class OrgSwitcherInteractor {
  constructor(selector?: string) {}


  orgNames = findAll('[data-test-org-select-item]');
  selectOrg = clickable('[data-test-org-select-item]');
}

export default new OrgSwitcherInteractor('[data-test-org-switcher]');
