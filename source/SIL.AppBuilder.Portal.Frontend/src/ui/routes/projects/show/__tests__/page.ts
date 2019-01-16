// tslint:disable:max-classes-per-file

import {
  interactor,
  clickable, text, isPresent, scoped, collection
} from '@bigtest/interactor';

import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import userInteractor from '@ui/components/inputs/user-select/__tests__/page';
import reviewerInteractor from '@ui/routes/projects/show/overview/reviewers/__tests__/page';
import detailsInteratctor from '@ui/routes/projects/show/overview/details/__tests__/page';
import productsInteractor from '../overview/products/-page';



@interactor
export class ProductFilesInteractor{
  constructor(selector?: string){}
  selectedBuild = text('[data-test-resource-select]');
  artifactCount = text('[data-test-count]');
}

@interactor
export class ProjectFilesInteractor{
  constructor(selector?: string){}
  products = collection('[data-test-build]', ProductFilesInteractor);
}


@interactor
export class ProjectInteractor {
  constructor(selector?: string) { }

  projectName = text('[data-test-project-name]');
  clickArchiveLink = clickable('[data-test-archive]');
  archiveText = text('[data-test-archive] span');
  publicText = text('[data-test-project-visibility-label]');
  switchToFilesTab = clickable('[data-test-project-files-tab]');

  projectFiles = scoped('[data-test-project-files]', ProjectFilesInteractor);

  isAutomaticRebuildChecked = isPresent('[data-test-project-settings-automatic-build].checked');
  isAllowDownloadChecked = isPresent('[data-test-project-settings-allow-download].checked');
  isPublic = isPresent('[data-test-project-settings-project-visibility].checked');
  isProductModalPresent = isPresent('[data-test-project-product-popup]');
  isMultiSelectPresent = isPresent('[data-test-multi-select]');

  hasUserSelect = isPresent('[data-test-user-select]');
  groupSelect = groupInteractor;
  userSelect = userInteractor;
  reviewers = reviewerInteractor;
  detailsInteractor = detailsInteratctor;

  // TODO: don't use interactor in the name, it's an implementation detail
  productsInteractor = productsInteractor;
  productsList = productsInteractor;
}

export default new ProjectInteractor('[data-test-project]');
