import {
  clickable,
  text,
  isPresent,
  fillable,
  collection,
  interactor,
  Interactor,
} from '@bigtest/interactor';

class Products {

  clickManageProductButton = clickable('[data-test-project-products-manage-button]');
  itemsText = collection('[data-test-project-product-name]');

}

export const ProductsInteractor = interactor(Products);
export type TInteractor = Products & Interactor;

export default new (ProductsInteractor as any)('[data-test-project-products]') as TInteractor;