import React from 'react';
import { compose } from 'recompose';
import {
  requireOrganizationToBeSelected,
  useCurrentOrganization,
} from '@data/containers/with-current-organization';

import { useProjectImportHelpers } from './with-data';
import { withAccessRestriction } from './with-access-restriction';
import Display from './display';

export const pathName = '/projects/import';

function ImportProjectsRoute() {
  const { create } = useProjectImportHelpers();
  const { currentOrganizationId, currentOrganization } = useCurrentOrganization();

  return (
    <Display
      {...{
        create,
        currentOrganizationId,
        currentOrganization,
      }}
    />
  );
}

export default compose(requireOrganizationToBeSelected, withAccessRestriction)(ImportProjectsRoute);
