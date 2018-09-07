import {
  interactor,
  clickable, text, isPresent
} from '@bigtest/interactor';

import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import userInteractor from '@ui/components/inputs/user-select/__tests__/page';

@interactor
export class ProjectInteractor {
  constructor(selector?: string) { }

  clickArchiveLink = clickable('[data-test-archive]');
  archiveText = text('[data-test-archive] span');

  isAutomaticRebuildChecked = isPresent('[data-test-project-settings-automatic-build].checked');
  isAllowDownloadChecked = isPresent('[data-test-project-settings-allow-download].checked');

  groupSelect = groupInteractor;
  userSelect = userInteractor;
}

export default new ProjectInteractor('[data-test-project]');
