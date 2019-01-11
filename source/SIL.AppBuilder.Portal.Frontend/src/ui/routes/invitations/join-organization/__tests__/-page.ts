
import {
  interactor,
  Interactor,
  scoped,
  text,
} from '@bigtest/interactor';

class OrganizationMembershipInvitePageInteractor {
  constructor(selector?: string){}

  homeLink = scoped('[data-test-home-link]');
  errorMessage = text('[data-test-error]');
}

const i = interactor(OrganizationMembershipPageInteractor);
export type TOrganizationMembershipInvitePageInteractor = OrganizationMembershipInvitePageInteractor & Interactor;
export default i as TOrganizationMembershipInvitePageInteractor;
