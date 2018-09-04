import {
  interactor,
  text,
  clickable,
  is,
  collection
} from '@bigtest/interactor';

@interactor
export class MultiGroupSelectInteractor {

  constructor(selector?: string) { }

  dropdownText = text('[data-test-multi-group-select] .text');
  clickDropdown() {
    return this.click();
  }
  groupCheckboxes = collection('[data-test-multi-group-checkbox] input[type="checkbox"]');

  chooseGroup(optionText: string) {
    return this
      .when(() => {
        const el = this
          .$$('.item label')
          .find(item => item.innerText.includes(optionText));

        if (!el) {
          throw new Error(`cannot find ".item label" with text "${optionText}"`);
        }

        return el;
      }).do(el => el.click());
  }

//  selectFirstGroupInDropdown = this.groupCheckboxes.item(0).click();
//  selectSecondGroupInDropdown = this.groupCheckboxes.item(1).click();

  // selectAllGroups = collection('[data-test-multi-group-checkbox]')

}

export default new MultiGroupSelectInteractor('[data-test-multi-group-select]:first-child');