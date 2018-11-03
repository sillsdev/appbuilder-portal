import {
  interactor,
  text,
  is,
  collection
} from '@bigtest/interactor';

@interactor
export class GroupSelectInteractor {
  constructor(selector?: string) { }

  isDisabled = is('.disabled');
  selectedGroup = text('.selected');
  noAvailableGroupsText = text('[data-test-no-available-groups]');

  options = collection('.item');

  chooseGroup(optionText: string) {
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

export default new GroupSelectInteractor('[data-test-group-select]');
