import {
  interactor,
  clickable,
  text,
  fillable,
  isPresent,
  collection,
  scoped,
  Interactor
} from '@bigtest/interactor';

class Page {
  organizationName = text('[data-test-org-name]');
  orgOwnerName = text('[data-test-org-owner]');
  ownerName = text('[data-test-project-owner]');
  description = text('[data-test-description]');

  image = scoped('[data-test-logo]', {
    exists: isPresent('img'),
  });

  products = scoped('[data-test-products]', {
    artifacts: scoped('[data-test-product-artifacts]', {
      toggle: clickable('[data-test-artifact-header]'),
      amount: text('[data-test-artifact-header] [data-test-count'),
    }),
  });
}

export const PageInteractor = interactor(Page);

export type TPageinationInteractor = Page & Interactor;

export default new (PageInteractor as any)('[data-test-public-project]') as TPageinationInteractor;
