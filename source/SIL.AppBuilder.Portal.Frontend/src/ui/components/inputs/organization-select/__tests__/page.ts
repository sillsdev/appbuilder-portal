import { interactor, Interactor, text, is, collection } from '@bigtest/interactor';

class OrgSelect {
  isDisabled = is('.disabled');
  selected = text('.text[role="alert"]');

  options = collection('.item');

  choose(this: Interactor, optionText: string) {
    return this.when(() => {
      const el = this.$$('.item').find((item) => item.innerText.includes(optionText));

      if (!el) {
        throw new Error(`cannot find ".item" with text "${optionText}"`);
      }

      return el;
    }).do((el) => el.click());
  }
}

export const OrgSelectInteractor = interactor(OrgSelect);

export type TOrgSelectInteractor = OrgSelect & Interactor;

export default new (OrgSelectInteractor as any)(
  '[data-test-organization-select]'
) as TOrgSelectInteractor;
