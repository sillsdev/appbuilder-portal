import {
    interactor,
    text,
    is,
    collection
  } from '@bigtest/interactor';

  @interactor
  export class UserSelectInteractor {
    constructor(selector?: string) { }

    isDisabled = is('.disabled');
    selectedUser = text('div.text[aria-live="polite"]');

    options = collection('.item');

    chooseUser(optionText: string) {
      return this
        .when(() => {
          const el = this
            .$$('.item')
            .find(item => item.innerText.includes(optionText));

          if (!el) {
            throw new Error(`cannot find ".item" with text "${optionText}"`);
          }

          return el;
        }).do(el => el.click());
    }
  }

  export default new UserSelectInteractor('[data-test-user-select]');
