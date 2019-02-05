import {
  interactor,
  isPresent,
  clickable,
  fillable,
  value,
  selectable,
  text,
} from '@bigtest/interactor';

@interactor
export class FormInteractor {
  constructor(selector?: string) {}

  fillFirstName = fillable('[data-test-profile-firstname]');
  fillLastName = fillable('[data-test-profile-lastname]');
  fillEmail = fillable('[data-test-profile-email]');
  fillPhone = fillable('[data-test-profile-phone]');
  fillLocalization = fillable('[data-test-profile-localization]');
  fillPublishingKey = fillable('[data-test-profile-publishing-key]');

  clickEmailNotification = clickable('[data-test-profile-email-notification] input');
  clickProfileVisibility = clickable('[data-test-profile-visible-profile] input');
  clickSubmit = clickable('[data-test-profile-submit]');

  firstname = value('[data-test-profile-firstname]');
  lastname = value('[data-test-profile-lastname]');
  email = value('[data-test-profile-email]');
  phone = value('[data-test-profile-phone]');
  localization = value('[data-test-profile-localization]');
  isEmailNotificationChecked = isPresent('[data-test-profile-email-notification].checked');
  profileVisibility = isPresent('[data-test-profile-visible-profile].checked');
  profileVisibilityText = value('[data-test-profile-visible-text]');
  publishingKeyText = value('[data-test-profile-publishing-key]');
}

export default new FormInteractor('[data-test-edit-profile]');
