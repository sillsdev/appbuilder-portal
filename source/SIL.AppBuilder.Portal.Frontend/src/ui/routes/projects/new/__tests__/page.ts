import {
  interactor,
  clickable,
  text,
  selectable,
  isPresent,
  fillable,
  is
} from '@bigtest/interactor';

@interactor
export class CreateProjectInteractor {
  constructor(selector?: string) { }

  isSaveDisabled = isPresent('[data-test-save].disabled');

  fillName = fillable('[data-test-name]');
  fillLanguage = fillable('[data-test-language]');
  fillType = fillable('[data-test-type]');
  toggleVisibility = clickable('[data-test-visibility]');

  isVisibilityChecked = is('[data-test-visibility]', ':checked');


  selectedGroup = text('.selected');
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

export default new CreateProjectInteractor('[data-test-new-project-form]');
