import { interactor, isPresent, text, Interactor, triggerable } from '@bigtest/interactor';
import groupInteractor from '@ui/components/inputs/group-select/__tests__/page';
import applicationTypeInteractor from '@ui/components/inputs/application-type-select/__tests__/page';

@interactor
export class ImportProjectsInteractor {
  constructor(selector?: string) {}

  isSaveDisabled = isPresent('[data-test-save].disabled');

  noAvailableGroupsText = text('[data-test-no-available-groups]');

  groupSelect = groupInteractor;
  applicationTypeSelect = applicationTypeInteractor;
  importFileInput = new Interactor('[data-test-import-input-file]');

  async setFile(file: File) {
    let input = await new Interactor().find('[data-test-import-input-file]');
    var dt = new DataTransfer();
    dt.items.add(file);
    console.log('input:', input);
    input.files = dt.files;

    if ('createEvent' in document) {
      var evtInput = document.createEvent('HTMLEvents');
      evtInput.initEvent('input', true, false);
      input.dispatchEvent(evtInput);
      var evtChange = document.createEvent('HTMLEvents');
      evtChange.initEvent('change', true, false);
      input.dispatchEvent(evtChange);
    }
  }
}

export default new ImportProjectsInteractor('[data-test-import-projects-form]');
