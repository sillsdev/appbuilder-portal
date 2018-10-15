import {
  isPresent,
  hasClass,
  collection,
  Interactor,
  interactor
} from '@bigtest/interactor';


class MultiSelect {
  items = collection('[data-test-item-checkbox]', {
    isChecked: hasClass('checked')
  });
  itemsText = collection('[data-test-item-text]');
  isListEmpty = isPresent('[data-test-empty-list]');
}

export const MultiSelectInteractor = interactor(MultiSelect);
export type TInteractor = MultiSelect & Interactor;

export default new (MultiSelectInteractor as any)('[data-test-multi-select]') as TInteractor;