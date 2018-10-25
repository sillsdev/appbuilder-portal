import {
  clickable,
  text,
  collection,
  interactor,
  Interactor,
} from '@bigtest/interactor';

import ProductModalInteractor from './-modal';

class Products {

  clickManageProductButton = clickable('[data-test-project-products-manage-button]');
  itemsText = collection('[data-test-project-product-name]');
  emptyLabel = text('[data-test-project-product-empty-text]');

  modalInteractor = ProductModalInteractor;
}

export const ProductsInteractor = interactor(Products);
export type TInteractor = Products & Interactor;

export default new (ProductsInteractor as any)('[data-test-project-products]') as TInteractor;