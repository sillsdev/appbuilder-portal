import {
  interactor, isPresent,
  hasClass, collection
} from '@bigtest/interactor';

@interactor
export class ProductDefinitionInteractor {
  constructor(selector?: string) { }

  products = collection('[data-test-product-definition-checkbox]');
  isFirstProductChecked = hasClass('[data-test-product-definition-checkbox]:first-child','checked');
  isProductListEmpty = isPresent('[data-test-empty-products]');
}

export default new ProductDefinitionInteractor('[data-test-org-settings-products]');