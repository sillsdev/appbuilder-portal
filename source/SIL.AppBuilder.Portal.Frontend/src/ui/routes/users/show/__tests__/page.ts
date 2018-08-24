import {
  interactor, isPresent
} from '@bigtest/interactor';

@interactor
export class UserInteractor {
  constructor(selector?: string) { }

  name = isPresent('[data-test-show-profile-name]');
  email = isPresent('[data-test-show-profile-email]');
  timezone = isPresent('[data-test-show-profile-timezone');
  phone = isPresent('[data-test-show-profile-phone');
  image = isPresent('[data-test-show-profile-image]');
}

export default new UserInteractor('[data-test-show-profile]');
