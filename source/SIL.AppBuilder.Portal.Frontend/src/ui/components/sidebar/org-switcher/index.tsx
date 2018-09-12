import { compose, withProps } from 'recompose';

import { withCurrentOrganization, IProvidedProps as WithCurrentOrgProps } from '@data/containers/with-current-organization';
import { withTranslations } from '@lib/i18n';

import { withRedux } from './with-redux';
import { withData } from './with-data';
import { IGivenProps } from './types';
import Display from './display';
import { withCurrentUser } from '@data/containers/with-current-user';

export default compose<IGivenProps, {}>(
  withCurrentUser(),
  withTranslations,
  withRedux,
  withCurrentOrganization,
  withProps(({ currentOrganizationId }: WithCurrentOrgProps) => ({
    allOrgsSelected: '' === currentOrganizationId
  })),
  withData,
)(Display);
