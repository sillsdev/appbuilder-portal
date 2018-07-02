import {
  interactor,
  clickable,
  text,
  isPresent
} from '@bigtest/interactor';

@interactor
export class AppInteractor {
  constructor(selector?: string) { }

  headers = text('h1');

}

export default new AppInteractor('[data-test-app-container]');
