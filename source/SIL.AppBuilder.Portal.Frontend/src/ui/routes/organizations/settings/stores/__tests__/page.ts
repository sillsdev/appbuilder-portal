import { interactor, isPresent, hasClass, collection } from '@bigtest/interactor';

@interactor
export class StoreInteractor {
  constructor(selector?: string) {}

  stores = collection('[data-test-store-checkbox]', {
    isChecked: hasClass('checked'),
  });

  storesText = collection('[data-test-store-text]');

  isStoreListEmpty = isPresent('[data-test-empty-stores]');
}

export default new StoreInteractor('[data-test-org-settings-stores]');
