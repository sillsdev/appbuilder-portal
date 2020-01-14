import { interactor, Interactor, clickable, hasClass } from '@bigtest/interactor';

import ProductMultiSelectInteractor from './-multi';

class ProductModal {
  isVisible = hasClass('visible');
  closePopup = clickable('[data-test-project-product-close-button]');

  // TODO: don't use interactor in the name, it's an implementation detail
  multiSelectInteractor = ProductMultiSelectInteractor;
  multiSelect = ProductMultiSelectInteractor;
}

export const AddProductModalInteractor = interactor(ProductModal);
export const RemoveProductModalInteractor = interactor(ProductModal);
export type TInteractor = ProductModal & Interactor;

export const RemoveProductModal = new (RemoveProductModalInteractor as any)(
  '[data-test-project-product-remove-popup'
) as TInteractor;
export default new (AddProductModalInteractor as any)(
  '[data-test-project-product-add-popup]'
) as TInteractor;
