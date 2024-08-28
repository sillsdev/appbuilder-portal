import Store from '@orbit/store';
import { attributesFor } from 'react-orbitjs';

import { roleInOrganizationOfResource } from '../../with-role';

import { ROLE } from '~/data/models/role';
import { UserResource, ProjectResource, idFromRecordIdentity } from '~/data';

export function canUserArchive(dataStore: Store, user: UserResource, project: ProjectResource) {
  const currentUserId = parseInt(idFromRecordIdentity(user), 10);
  const { ownerId } = attributesFor(project);
  const projectOwnerId = parseInt(ownerId, 10);
  const isOwner = projectOwnerId === currentUserId;
  const canArchive =
    isOwner || roleInOrganizationOfResource(user, dataStore, project, ROLE.OrganizationAdmin);

  return canArchive;
}
