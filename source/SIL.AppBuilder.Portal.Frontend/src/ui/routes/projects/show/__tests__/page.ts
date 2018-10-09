import {
  interactor,
  clickable, text, isPresent
} from '@bigtest/interactor';

import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import userInteractor from '@ui/components/inputs/user-select/__tests__/page';
import reviewerInteractor from '@ui/routes/projects/show/reviewers/__tests__/page';
import detailsInteratctor from '@ui/routes/projects/show/details/__tests__/page';

@interactor
export class ProjectInteractor {
  constructor(selector?: string) { }

  clickArchiveLink = clickable('[data-test-archive]');
  archiveText = text('[data-test-archive] span');
  publicText = text('[data-test-project-visibility-label]');

  isAutomaticRebuildChecked = isPresent('[data-test-project-settings-automatic-build].checked');
  isAllowDownloadChecked = isPresent('[data-test-project-settings-allow-download].checked');

  groupSelect = groupInteractor;
  userSelect = userInteractor;
  reviewers = reviewerInteractor;
  detailsInteractor = detailsInteratctor;
}

export default new ProjectInteractor('[data-test-project]');
