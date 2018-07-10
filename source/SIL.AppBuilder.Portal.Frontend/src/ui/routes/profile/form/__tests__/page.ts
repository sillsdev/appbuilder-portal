
import {
  interactor, isPresent,
  clickable, fillable, value
} from '@bigtest/interactor';

@interactor
export class FormInteractor {
  constructor(selector?: string) { }

  fillName = fillable('[data-test-profile-name]');
  fillEmail = fillable('[data-test-profile-email]');
  fillLocalization = fillable('[data-test-profile-localization]');
  clickEmailNotification = clickable('[data-test-profile-email-notification]');
  fillSSHKey = fillable('[data-test-profile-ssh-key]');
  clickSubmit = clickable('[data-test-profile-submit]');

  name = value('[data-test-profile-name]');
  email = value('[data-test-profile-email]');
  localization = value('[data-test-profile-localization]');
  emailNotification = isPresent('[data-test-profile-email-notification].checked');
  sshKey = value('[data-test-profile-ssh-key]');

}

export default new FormInteractor('[data-test-edit-profile]');
