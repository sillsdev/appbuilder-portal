import { interactor, isPresent, attribute } from '@bigtest/interactor';

@interactor
export class UserInteractor {
  constructor(selector?: string) {}

  isNamePresent = isPresent('[data-test-show-profile-name]');
  isEmailPresent = isPresent('[data-test-show-profile-email]');
  isTimezonePresent = isPresent('[data-test-show-profile-timezone');
  isphonePresent = isPresent('[data-test-show-profile-phone');
  isImagePresent = isPresent('[data-test-show-profile-image]');
  imageSrc = attribute('[data-test-show-profile-image]', 'src');
}

export default new UserInteractor('[data-test-show-profile]');
