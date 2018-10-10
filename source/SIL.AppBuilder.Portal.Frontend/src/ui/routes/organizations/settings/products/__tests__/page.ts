import {
  interactor, isPresent,
  hasClass, collection
} from '@bigtest/interactor';

@interactor
export class ProductDefinitionInteractor {
  constructor(selector?: string) { }

  products = collection('[data-test-product-definition-checkbox]', {
    isChecked: hasClass('checked')
  });

  productsText = collection('[data-test-product-definition-text]');


  isProductListEmpty = isPresent('[data-test-empty-products]');
}

export default new ProductDefinitionInteractor('[data-test-org-settings-products]');