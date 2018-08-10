import {
  interactor,
  clickable, text
} from '@bigtest/interactor';

@interactor
export class ProjectInteractor {
  constructor(selector?: string) { }

  clickArchiveLink = clickable('[data-test-archive]');
  archiveText = text('[data-test-archive] span');

}

export default new ProjectInteractor('[data-test-project]');