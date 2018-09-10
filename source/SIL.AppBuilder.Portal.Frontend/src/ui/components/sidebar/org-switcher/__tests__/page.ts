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

  chooseOrganization(orgText: string) {
    return this.when(() => {
      const el = this
        .$$('.item')
        .find(item => item.innerText.includes(orgText));

        if (!el) {
          throw new Error(`cannot find ".item" with text "${orgText}"`);
        }

        return el;
    }).do(el => el.click());
  }

  selectAllOrg = clickable('[data-test-select-item-all-org]');
  isSearchVisible = isPresent('[data-test-org-switcher-search]');

}

export default new OrgSwitcherInteractor('[data-test-org-switcher]');
