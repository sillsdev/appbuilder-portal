import { interactor, isPresent, text, Interactor, triggerable } from '@bigtest/interactor';
import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import applicationTypeInteractor from '@ui/components/inputs/application-type-select/__tests__/page';

@interactor
export class FileInputInteractor {
  constructor(selector?: string) {}

  change = (json: any) => {
    console.log('change', json);
    const file = new File([JSON.stringify(json)], 'file.json', { type: 'application/json' });

    const fileList = {
      0: file,
      length: 1,
      item: function(index: number) {
        return file;
      },
    };
    triggerable('input', {
      target: { files: fileList },
    });
  };
}

@interactor
export class ImportProjectsInteractor {
  constructor(selector?: string) {}

  isSaveDisabled = isPresent('[data-test-save].disabled');

  noAvailableGroupsText = text('[data-test-no-available-groups]');

  groupSelect = groupInteractor;
  applicationTypeSelect = applicationTypeInteractor;
  importFileInput = new FileInputInteractor('[data-test-import-input-file]');
}

export default new ImportProjectsInteractor('[data-test-import-projects-form]');
