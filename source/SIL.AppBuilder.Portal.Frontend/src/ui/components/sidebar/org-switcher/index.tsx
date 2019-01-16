import { compose, withProps } from 'recompose';
import {
  withCurrentOrganization,
  IProvidedProps as WithCurrentOrgProps,
} from '@data/containers/with-current-organization';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withTranslations } from '@lib/i18n';
import { withRouter } from 'react-router-dom';

import { withData } from './with-data';
import Display from './display';
import { IGivenProps } from './types';

export default compose<IGivenProps, {}>(
  withCurrentUserContext,
  withRouter,
  withTranslations,
  withCurrentOrganization,
  withProps(({ currentOrganizationId }: WithCurrentOrgProps) => ({
    allOrgsSelected: '' === currentOrganizationId,
  })),
  withData
)(Display);
