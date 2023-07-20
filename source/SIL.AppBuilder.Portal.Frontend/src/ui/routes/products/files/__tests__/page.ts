import { interactor, text, isPresent } from '@bigtest/interactor';

@interactor
export class ProductFilesInteractor {
  constructor(selector?: string) {}
  selectedBuild = text('[data-test-resource-select]');
  artifactCount = text('[data-test-count]');
  publicationInfoVisible = isPresent('[data-test-publication-container]');
  publicationChannel = text('[data-test-product-publication-channel]');
  publicationStatus = text('[data-test-product-publication-status]');
}

export default new ProductFilesInteractor('[data-test-product-files]');
