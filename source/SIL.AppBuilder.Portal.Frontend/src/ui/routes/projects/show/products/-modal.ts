import {
  interactor,
  Interactor,
  clickable,
  hasClass,
} from '@bigtest/interactor';

import MultiSelectInteractor from '@ui/components/inputs/multi-select/-page';

class ProductModal {
  isVisible = hasClass("visible");
  closePopup = clickable('[data-test-project-product-close-button]');
  multiSelectInteractor = MultiSelectInteractor;
}

export const ProductModalInteractor = interactor(ProductModal);
export type TInteractor = ProductModal & Interactor;

export default new (ProductModalInteractor as any)('[data-test-project-product-popup]') as TInteractor;
