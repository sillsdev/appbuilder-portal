import {
  interactor,
  clickable, text, isPresent
} from '@bigtest/interactor';

@interactor
export class Project {
  constructor(selector?: string) { }

  clickArchiveLink = clickable('[data-test-archive]');
  archiveText = text('[data-test-archive] span');

}

export default new Project('[data-test-project]');