import { useCallback } from 'react';
import { useOrbit } from 'react-orbitjs/dist';

import { ProjectImportResource } from '@data';

import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as PROJECT_IMPORT, ProjectImportAttributes } from '@data/models/project-import';
import { useCurrentOrganization } from '@data/containers/with-current-organization';
import { recordIdentityFromKeys, create as createRecord } from '@data/store-helpers';

import { useCurrentUser } from '~/data/containers/with-current-user';

export interface IProvidedProps {
  create: (
    attributes: ProjectImportAttributes,
    groupId: string,
    typeId: string
  ) => Promise<ProjectImportResource>;
}

export function useProjectImportHelpers(): IProvidedProps {
  const { dataStore } = useOrbit();
  const { currentOrganizationId } = useCurrentOrganization();
  const { currentUser } = useCurrentUser();

  const create = useCallback(
    async (attributes: ProjectImportAttributes, groupId: string, typeId: string) => {
      const groupIdentity = recordIdentityFromKeys({ type: 'group', id: groupId });
      const applicationTypeIdentity = recordIdentityFromKeys({
        type: 'applicationType',
        id: typeId,
      });

      const projectImport = await createRecord(dataStore, PROJECT_IMPORT, {
        attributes,
        relationships: {
          owner: currentUser,
          group: groupIdentity,
          organization: { id: currentOrganizationId, type: ORGANIZATION },
          type: applicationTypeIdentity,
        },
      });

      return projectImport;
    },
    [currentOrganizationId, currentUser, dataStore]
  );

  return { create };
}
