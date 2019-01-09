import {
  interactor, Interactor, hasClass,
  clickable, collection, text, scoped, isPresent
} from '@bigtest/interactor';

@interactor class ProjectHeaderInteractor{
  constructor(selector?: string) { }
  static defaultScope = '[data-test-project-action-header]';
  archive = scoped('[data-test-archive-button]');
  reactivate = scoped('[data-test-reactivate-button]');
}


export default ProjectHeaderInteractor;
