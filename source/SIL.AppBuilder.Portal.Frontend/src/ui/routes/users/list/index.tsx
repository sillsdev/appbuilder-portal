import { compose } from 'recompose';

import { ROLE }  from '@data/models/role';
import { withRole } from '@data/containers/with-role';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withRoles } from '@data/containers/resources/role';

import { withData } from '@ui/components/user-table/data';
import { withTranslations } from '@lib/i18n';

import Display from './display';

export const pathName = '/users';

export default compose(
  withRole(ROLE.OrganizationAdmin, {
    redirectTo: '/'
  }),
  withTranslations,
  withCurrentUser(),
  withRoles(),
  withFiltering(),
  withData,
)(Display);
