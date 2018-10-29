import { compose } from 'recompose';

import { ROLE, withRole } from '@data/containers/with-role';

import Display from './display';

import { withAccessRestriction } from './with-access-restriction';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withData } from './with-data';
import { withTranslations } from '@lib/i18n';
import { withProjectOperations } from './with-project-operations';

import './project.scss';

export const pathName = '/projects/:id';

export default compose(
  withTranslations,
  withCurrentUser(),
  withData,
  withProjectOperations,
  // todo - extract this to a more general thing?
  withAccessRestriction,
  /* withRole(ROLE.OrgAdmin, { */
  /*   redirectTo: '/', */
  /*   checkOrganizationOf: ({ project }) => project */
  /* }), */
)(Display);
