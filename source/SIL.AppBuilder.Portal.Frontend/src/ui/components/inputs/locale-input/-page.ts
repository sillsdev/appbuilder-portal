import {
  interactor,
  Interactor,
  hasClass,
  scoped,
  collection,
  clickable,
  isPresent,
  triggerable,
  fillable,
  text,
  value,
  attribute,
} from '@bigtest/interactor';
import { when } from '@bigtest/convergence';
import { Simulate } from 'react-dom/test-utils';
import { assert } from 'chai';
import { wait } from 'tests/helpers';

class LocaleInput extends Interactor {
  static defaultScope = '[data-test-locale-input-container]';

  async searchAndSelect(searchTerm: string) {
    await when(() => assert(this.isPresent, `\nexpected language picker to be visible\n`));

    await this.input.fill(searchTerm);
    // bigtest blur/focus don't work?
    Simulate.blur(this.input.$root);
    Simulate.focus(this.input.$root);

    await when(() => assert(this.dropdown.isOpen, `\nexpected dropdown to be open\n`));

    let suggestions = this.dropdown.suggestions();

    if (!suggestions || suggestions.length === 0) {
      throw new Error('\nthere are no suggestions!\n');
    }

    let suggestion = suggestions.find((suggestion) => {
      return suggestion.text.includes(searchTerm);
    });

    // for some reason bigtest click doesn't work?
    Simulate.click(suggestion.$root);

    let tag = suggestion.languageTag;

    await when(() =>
      assert(
        tag.includes(this.input.value),
        `\nexpected selection of suggestion to set the input value to the suggestion's language tag.\n`
      )
    );

    console.log('hey props', this.input.valueFromProps, this.input.value);
    await when(() =>
      assert(
        this.input.valueFromProps === this.input.value,
        `\nexpected the selected language tag to set the value on the calling component. 
          It is possible that the change event has not yet fired\n`
      )
    );
  }

  doesInputMatchLanguage = hasClass('has-match');
  doesInputNotMatchLanguage = hasClass('match-missing');

  input = scoped('[data-test-language]', {
    fill: fillable(),
    value: value(),
    click: clickable(),
    valueFromProps: attribute('data-test-value-from-props'),
  });

  dropdown = scoped('.react-autosuggest__suggestions-container', {
    isOpen: hasClass('react-autosuggest__suggestions-container--open'),

    pressUp: triggerable('keypress', {
      key: 'ArrowUp',
    }),
    pressDown: triggerable('keypress', {
      key: 'ArrowDown',
    }),

    pressEnter: triggerable('keypress', { key: 'Enter' }),
    pressEscape: triggerable('keypress', { key: 'Escape' }),

    suggestions: collection('.react-autosuggest__suggestion', {
      text: text(),
      click: clickable(),

      languageTag: text('[data-test-tag]'),

      isFocussed: hasClass('react-autosuggest__suggestion--highlighted'),
    }),
  });
}

export const LocaleInputInteractor = interactor(LocaleInput);

export default new LocaleInputInteractor(LocaleInput.defaultScope);
