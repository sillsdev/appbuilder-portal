import { compose, withProps } from 'recompose';

import { IGivenProps } from './types';
import Display from './display';
import { withCurrentOrganization, IProvidedProps as WithCurrentOrgProps } from '@data/containers/with-current-organization';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withData } from './with-data';
import { withTranslations } from '@lib/i18n';
import { withRouter } from 'react-router-dom';

export default compose<IGivenProps, {}>(
  withCurrentUser(),
  withRouter,
  withTranslations,
  withCurrentOrganization,
  withProps(({ currentOrganizationId }: WithCurrentOrgProps) => ({
    allOrgsSelected: '' === currentOrganizationId
  })),
  withData,
)(Display);
