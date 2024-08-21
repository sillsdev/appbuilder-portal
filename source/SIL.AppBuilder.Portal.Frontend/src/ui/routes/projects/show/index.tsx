import { compose } from 'recompose';
import { isRelatedTo } from '@data';
import { withRole } from '@data/containers/with-role';
import { ROLE } from '@data/models/role';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withTranslations } from '@lib/i18n';

import Display from './display';
import { withAccessRestriction } from './with-access-restriction';
import { withData } from './with-data';

export const pathName = '/projects/:id';

export default compose(
  withTranslations,
  withCurrentUserContext,
  withData,
  // todo - extract this to a more general thing?
  withAccessRestriction,
  withRole(ROLE.OrganizationAdmin, {
    redirectTo: '/',
    checkOrganizationOf: ({ project }) => project,
    checkGroupsOf: ({ project }) => project,
    overrideIf: ({ project, currentUser }) => isRelatedTo(project, 'owner', currentUser.id),
  })
)(Display);
