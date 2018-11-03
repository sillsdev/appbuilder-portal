import { compose } from 'recompose';

import { withData } from '@ui/components/user-table/data';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withRoles } from '@data/containers/resources/role';
import { withTranslations } from '@lib/i18n';

import Display from './display';

export const pathName = '/users';

export default compose(
  withTranslations,
  withCurrentUser(),
  withRoles(),
  withFiltering(),
  withData,
)(Display);
