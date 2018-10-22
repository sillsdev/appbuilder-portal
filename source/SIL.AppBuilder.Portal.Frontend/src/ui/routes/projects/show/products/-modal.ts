import {
  isVisible,
  interactor,
  Interactor,
  clickable,
} from '@bigtest/interactor';

import MultiSelectInteractor from '@ui/components/inputs/multi-select/-page';

class ProductModal {

  isVisible = isVisible('[data-test-project-product-popup]');
  closePopup = clickable('[data-test-project-product-close-button]');
  multiSelectInteractor = MultiSelectInteractor;

}

export const ProductModalInteractor = interactor(ProductModal);
export type TInteractor = ProductModal & Interactor;

export default new (ProductModalInteractor as any)('.ui.page.modals') as TInteractor;