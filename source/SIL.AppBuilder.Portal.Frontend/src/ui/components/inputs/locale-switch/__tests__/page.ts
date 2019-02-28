import { interactor, text, clickable, findAll, isPresent, selectable } from '@bigtest/interactor';

@interactor
export class LocaleSwitchInteractor {
  constructor(selector?: string) {}

  selected = text('.selected');
  chooseLanguage(optionText: string) {
    return this.when(() => {
      const el = this.$$('.item').find((item) => item.innerText.includes(optionText));

      if (!el) {
        throw new Error(`cannot find ".item" with text "${optionText}"`);
      }

      return el;
    }).do((el) => el.click());
  }
}

export default new LocaleSwitchInteractor('[data-test-locale-switcher]');
