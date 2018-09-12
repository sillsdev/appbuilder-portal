import {
  interactor,
  clickable, text, isPresent,
  fillable, count
} from '@bigtest/interactor';

import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import userInteractor from '@ui/components/inputs/user-select/__tests__/page';
import reviewerInteractor from '@ui/routes/project/reviewers/__tests__/page';

@interactor
export class ProjectInteractor {
  constructor(selector?: string) { }

  clickArchiveLink = clickable('[data-test-archive]');
  archiveText = text('[data-test-archive] span');

  isAutomaticRebuildChecked = isPresent('[data-test-project-settings-automatic-build].checked');
  isAllowDownloadChecked = isPresent('[data-test-project-settings-allow-download].checked');

  groupSelect = groupInteractor;
  userSelect = userInteractor;
  reviewers = reviewerInteractor;
}

export default new ProjectInteractor('[data-test-project]');
