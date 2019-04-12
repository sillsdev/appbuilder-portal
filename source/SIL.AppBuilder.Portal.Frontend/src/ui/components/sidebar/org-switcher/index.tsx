import { compose, withProps } from 'recompose';
import {
  withCurrentOrganization,
  IProvidedProps as WithCurrentOrgProps,
  useCurrentOrganization,
} from '@data/containers/with-current-organization';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withTranslations } from '@lib/i18n';
import { withRouter } from 'react-router-dom';

import { withData, useOrgSwitcherData } from './with-data';
import Display from './display';
import { IGivenProps } from './types';
import React from 'react';

export default function OrgSwitcher({ toggle, ...otherProps }) {
  const {
    searchTerm,
    searchResults,
    selectOrganization,
    didTypeInSearch,
  } = useOrgSwitcherData({ toggle });
  const { allOrgsSelected, currentOrganizationId } = useCurrentOrganization();

  return (
    <Display
      {...{
        allOrgsSelected,
        currentOrganizationId,
        selectOrganization,
        didTypeInSearch,
        searchResults,
        searchTerm,
      }}
    />
  );
}
