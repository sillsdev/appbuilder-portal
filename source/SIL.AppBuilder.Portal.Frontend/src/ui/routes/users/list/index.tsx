import { compose, withProps } from 'recompose';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withRoles } from '@data/containers/resources/role';
import {
  withCurrentOrganization,
  IProvidedProps as WithCurrentOrgProps,
} from '@data/containers/with-current-organization';
import { withData } from './user-table/data';
import { withTranslations } from '@lib/i18n';

import Display from './display';

export const pathName = '/users';

export default compose(
  withTranslations,
  withCurrentUserContext,
  withCurrentOrganization,
  withProps(({ currentOrganizationId }: WithCurrentOrgProps) => ({
    allOrgsSelected: '' === currentOrganizationId,
  })),
  withRoles(),
  withFiltering(),
  withData
)(Display);
