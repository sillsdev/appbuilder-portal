import {
  Interactor,
  interactor,
  clickable,
  findAll,
  isPresent,
  text,
} from '@bigtest/interactor';

class OrgSwitcher {
  orgNames = findAll('[data-test-org-select-item]');
  selectOrg = clickable('[data-test-org-select-item]');

  selectedOrg = text('[data-test-org-select-item].active');


  chooseOrganization(this: Interactor, orgText: string) {
    return this.when<HTMLElement>(() => {
      const el = this
        .$$('[data-test-org-select-item]')
        .find(item => item.innerText.includes(orgText));

        if (!el) {
          throw new Error(`cannot find ".item" with text "${orgText}"`);
        }

        return el;
    })
    .do(el => el.click());
  }
  selectAllOrg = clickable('[data-test-select-item-all-org]');
  isSearchVisible = isPresent('[data-test-org-switcher-search]');
}


export const OrgSwitcherInteractor = interactor(OrgSwitcher);

export type TOrgSwitcherInteractor = OrgSwitcher & Interactor;

export default new (OrgSwitcherInteractor as any)('[data-test-org-switcher]') as TOrgSwitcherInteractor;
