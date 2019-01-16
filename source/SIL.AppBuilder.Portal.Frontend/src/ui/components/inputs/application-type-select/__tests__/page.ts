import { interactor, text, is, collection } from '@bigtest/interactor';

@interactor
export class ApplicationTypeSelectInteractor {
  constructor(selector?: string) {}

  selectedApplicationType = text('.selected');

  options = collection('.item');

  chooseApplicationType(optionText: string) {
    return this.when(() => {
      const el = this.$$('.item').find((item) => item.innerText.includes(optionText));

      if (!el) {
        throw new Error(`cannot find ".item" with text "${optionText}"`);
      }

      return el;
    }).do((el) => el.click());
  }
}

export default new ApplicationTypeSelectInteractor('[data-test-application-type-select]');
