import {
  clickable,
  text,
  collection,
  scoped,
  isPresent,
  interactor,
  Interactor,
} from '@bigtest/interactor';
import MultiSelectInteractor from '@ui/components/inputs/multi-select/-page';

import ProductModalInteractor from './-modal';

class Products {
  clickManageProductButton = clickable('[data-test-project-products-manage-button]');
  itemsText = collection('[data-test-project-product-name]');
  emptyLabel = text('[data-test-project-product-empty-text]');
  isModalVisible = isPresent('[data-test-project-product-popup]');

  products = collection('[data-test-project-product-item]', {
    name: text('[data-test-project-product-name]'),
    hasProductLink: isPresent('[data-test-project-product-publishlink]'),
  });

  productNamed(named: string) {
    const item = this.products().find((p) => p.name.includes(named));

    if (!item) {
      throw new Error(`cannot find product named: ${named}`);
    }

    return item;
  }

  // TODO: don't use interactor in the name, it's an implementation detail
  modalInteractor = ProductModalInteractor;
  modal = ProductModalInteractor;
  storeModal = scoped('[data-test-project-product-store-select-modal]', {
    multiSelect: MultiSelectInteractor,
  });
}

export const ProductsInteractor = interactor(Products);
export type TInteractor = Products & Interactor;

export default new (ProductsInteractor as any)('[data-test-project-products]') as TInteractor;
