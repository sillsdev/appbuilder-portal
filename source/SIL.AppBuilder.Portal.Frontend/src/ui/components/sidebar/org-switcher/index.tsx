import { useCurrentOrganization } from '@data/containers/with-current-organization';
import React from 'react';

import { useOrgSwitcherData } from './with-data';
import Display from './display';

export default function OrgSwitcher({ toggle }) {
  const { searchTerm, searchResults, selectOrganization, didTypeInSearch } = useOrgSwitcherData({
    toggle,
  });
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
