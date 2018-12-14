import {
  interactor,
  clickable, text, isPresent
} from '@bigtest/interactor';

import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import userInteractor from '@ui/components/inputs/user-select/__tests__/page';
import reviewerInteractor from '@ui/routes/projects/show/reviewers/__tests__/page';
import detailsInteratctor from '@ui/routes/projects/show/details/__tests__/page';
import productsInteractor from '../products/-page';

@interactor
export class ProjectInteractor {
  constructor(selector?: string) { }

  projectName = text('[data-test-project-name]');
  clickArchiveLink = clickable('[data-test-archive]');
  archiveText = text('[data-test-archive] span');
  publicText = text('[data-test-project-visibility-label]');

  isAutomaticRebuildChecked = isPresent('[data-test-project-settings-automatic-build].checked');
  isAllowDownloadChecked = isPresent('[data-test-project-settings-allow-download].checked');
  isPublic = isPresent('[data-test-project-settings-project-visibility].checked');
  isProductModalPresent = isPresent('[data-test-project-product-popup]');

  hasUserSelect = isPresent('[data-test-user-select]');
  groupSelect = groupInteractor;
  userSelect = userInteractor;
  reviewers = reviewerInteractor;
  detailsInteractor = detailsInteratctor;
  productsInteractor = productsInteractor;
}

export default new ProjectInteractor('[data-test-project]');
