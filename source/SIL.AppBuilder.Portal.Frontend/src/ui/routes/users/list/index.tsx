import { compose, withProps } from 'recompose';

import { ROLE }  from '@data/models/role';
import { withRole } from '@data/containers/with-role';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withRoles } from '@data/containers/resources/role';
import { withCurrentOrganization, IProvidedProps as WithCurrentOrgProps } from '@data/containers/with-current-organization';

import { withData } from '@ui/components/user-table/data';
import { withTranslations } from '@lib/i18n';

import Display from './display';

export const pathName = '/users';

export default compose(
  withTranslations,
  withCurrentUser(),
  withRoles(),
  withFiltering(),
  withData,
  withCurrentOrganization,
  withProps(({ currentOrganizationId }: WithCurrentOrgProps) => ({
    allOrgsSelected: '' === currentOrganizationId
  })),
)(Display);
