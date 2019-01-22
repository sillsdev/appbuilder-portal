import { interactor, Interactor, clickable, hasClass, scoped } from '@bigtest/interactor';
import MultiSelectInteractor from '@ui/components/inputs/multi-select/-page';

class ProductModal {
  isVisible = hasClass('visible');
  closePopup = clickable('[data-test-project-product-close-button]');

  // TODO: don't use interactor in the name, it's an implementation detail
  multiSelectInteractor = MultiSelectInteractor;
  multiSelect = MultiSelectInteractor;
}

export const ProductModalInteractor = interactor(ProductModal);
export type TInteractor = ProductModal & Interactor;

export default new (ProductModalInteractor as any)(
  '[data-test-project-product-popup]'
) as TInteractor;
