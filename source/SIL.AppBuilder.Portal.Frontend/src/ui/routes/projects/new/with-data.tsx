import { useCallback } from 'react';
import { useOrbit } from 'react-orbitjs/dist';
import { ProjectResource } from '@data';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as PROJECT, ProjectAttributes } from '@data/models/project';
import { useCurrentUser } from '@data/containers/with-current-user';
import { useCurrentOrganization } from '@data/containers/with-current-organization';
import { recordIdentityFromKeys, create as createRecord } from '@data/store-helpers';

export interface IProvidedProps {
  create: (
    attributes: ProjectAttributes,
    groupId: string,
    typeId: string
  ) => Promise<ProjectResource>;
}

export function useNewProjectHelpers(): IProvidedProps {
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();
  const { currentOrganizationId } = useCurrentOrganization();

  const create = useCallback(
    async (attributes: ProjectAttributes, groupId: string, typeId: string) => {
      const groupIdentity = recordIdentityFromKeys({ type: 'group', id: groupId });
      const applicationTypeIdentity = recordIdentityFromKeys({
        type: 'applicationType',
        id: typeId,
      });

      const project = await createRecord(dataStore, PROJECT, {
        attributes,
        relationships: {
          owner: currentUser,
          group: groupIdentity,
          organization: { id: currentOrganizationId, type: ORGANIZATION },
          type: applicationTypeIdentity,
        },
      });

      return project;
    },
    [currentOrganizationId, currentUser, dataStore]
  );

  return { create };
}
