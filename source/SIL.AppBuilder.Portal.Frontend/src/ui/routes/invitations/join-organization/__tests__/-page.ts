import { interactor, Interactor, scoped, text } from '@bigtest/interactor';

class OrganizationMembershipInvite {
  constructor(selector?: string) {}

  homeLink = scoped('[data-test-home-link]');
  errorMessage = text('[data-test-error]');
}

export const OrganizationMembershipInvitePageInteractor = interactor(OrganizationMembershipInvite);
export type TOrganizationMembershipInvitePageInteractor = OrganizationMembershipInvite & Interactor;

export default new (OrganizationMembershipInvitePageInteractor as any)(
  '[data-test-organization-membership-invite]'
) as TOrganizationMembershipInvitePageInteractor;
