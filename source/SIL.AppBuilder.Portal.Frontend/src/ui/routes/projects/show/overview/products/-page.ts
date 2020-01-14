import {
  clickable,
  text,
  collection,
  scoped,
  isPresent,
  interactor,
  Interactor,
  attribute,
} from '@bigtest/interactor';
import { MultiSelectInteractor } from '@ui/components/inputs/multi-select/-page';
import TransitionDetailsModalInteractor from '@ui/components/product-transitions/-modal';

import AddProductModalInteractor from './-modal';
import { RemoveProductModal } from './-modal';

class Products {
  clickAddProductButton = clickable('[data-test-project-products-add-button]');
  clickRemoveProductButton = clickable('[data-test-project-products-remove-button]');
  itemsText = collection('[data-test-project-product-name]');
  emptyLabel = text('[data-test-project-product-empty-text]');
  isAddModalVisible = isPresent('[data-test-project-product-add-popup]');
  isRemoveModalVisible = isPresent('[data-test-project-product-remove-popup]');

  products = collection('[data-test-project-product-item]', {
    name: text('[data-test-project-product-name]'),
    hasProductLink: isPresent('[data-test-project-product-publishlink]'),
    apkLink: attribute('[data-test-product-apklink]', 'href'),
    clickDetailsLink: clickable('[data-test-transition-details-button]'),
    detailsText: text('[data-test-transition-details-button] span'),
  });
  productNamed(named: string) {
    const item = this.products().find((p) => p.name.includes(named));

    if (!item) {
      throw new Error(`cannot find product named: ${named}`);
    }

    return item;
  }

  // TODO: don't use interactor in the name, it's an implementation detail
  modalInteractor = AddProductModalInteractor;
  modal = AddProductModalInteractor;
  removeModal = RemoveProductModal;

  isStoreModalVisible = isPresent('[data-test-project-product-store-select-modal]');
  storeModal = scoped('[data-test-project-product-store-select-modal]', {
    multiSelect: new MultiSelectInteractor(),
  });

  detailsModal = new TransitionDetailsModalInteractor('[data-test-transitions-modal]');
}

export type TInteractor = Products & Interactor;
export const ProductsInteractor = interactor(Products) as TInteractor;

export default new (ProductsInteractor as any)('[data-test-project-products]') as TInteractor;
