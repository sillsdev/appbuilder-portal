
import {
  clickable,
  interactor,
  Interactor,
  scoped,
  text,
} from '@bigtest/interactor';

export class OrganizationMembershipPageInteractor {
  constructor(selector?: string){}

  homeLink = scoped('[data-test-home-link]');
  errorMessage = text('[data-test-error]');
}

const i = interactor(OrganizationMembershipPageInteractor);
export type TUsersPageInteractor = OrganizationMembershipPageInteractor & Interactor;
export default i as TUsersPageInteractor;
