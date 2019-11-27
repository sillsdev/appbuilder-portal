import { interactor, isPresent, text } from '@bigtest/interactor';
import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import applicationTypeInteractor from '@ui/components/inputs/application-type-select/__tests__/page';

@interactor
export class ImportProjectsInteractor {
  constructor(selector?: string) {}

  isSaveDisabled = isPresent('[data-test-save].disabled');

  noAvailableGroupsText = text('[data-test-no-available-groups]');

  groupSelect = groupInteractor;
  applicationTypeSelect = applicationTypeInteractor;
}

export default new ImportProjectsInteractor('[data-test-import-projects-form]');
