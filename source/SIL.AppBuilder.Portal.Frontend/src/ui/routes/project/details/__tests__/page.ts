import {
  interactor, text, isPresent
} from '@bigtest/interactor';

@interactor
export class ProjectDetailsInteractor {

  constructor(selector?: string) { }

  isApplicationTypePresent = isPresent('[data-test-project-detail-type]');
  applicationTypeText = text('[data-test-project-detail-type]');

}

export default new ProjectDetailsInteractor('[data-test-project-details]');