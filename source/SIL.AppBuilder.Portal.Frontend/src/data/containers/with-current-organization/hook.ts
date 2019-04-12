import { useRedux } from 'use-redux';

import { setCurrentOrganization } from '~/redux-store/data';

import { useRouter } from '~/lib/hooks';

import { useOrbit, localIdFromRecordIdentity } from 'react-orbitjs/dist';
import _ from 'lodash';

import { retrieveRelation } from '../with-relationship';
import { useCurrentUser } from '../with-current-user';

export function useCurrentOrganization() {
  const { history } = useRouter();
  const { currentUser, isSuperAdmin } = useCurrentUser();
  const {
    dataStore,
    subscriptions: { all },
  } = useOrbit({
    all: (q) => q.findRecords('organization'),
  });
  const [store, dispatch] = useRedux();
  const { currentOrganizationId } = store.data;

  const currentUserOrganizations = retrieveRelation(dataStore, [
    currentUser,
    'organizationMemberships',
    'organization',
  ]);

  let organizationsAvailableToUser = currentUserOrganizations;

  if (isSuperAdmin && all) {
    organizationsAvailableToUser = _.uniqBy([...currentUserOrganizations, ...all], (org) => org.id);
  }

  let currentOrganization;
  try {
    if (currentOrganizationId) {
      const localId = localIdFromRecordIdentity(dataStore, {
        type: 'organization',
        id: currentOrganizationId,
      });
      currentOrganization = dataStore.cache.query((q) =>
        q.findRecord({ type: 'organization', id: localId })
      );
    }
  } catch (e) {
    console.debug(`org not found for ${currentOrganizationId}`, e);
  }

  const allOrgsSelected = '' === currentOrganizationId;

  return {
    currentUserOrganizations,
    organizationsAvailableToUser,
    currentOrganizationId,
    currentOrganization,
    allOrgsSelected,
    setCurrentOrganizationId(id, options: { skipNav?: boolean } = {}) {
      dispatch(setCurrentOrganization(id));

      const opts = options || { skipNav: false };

      if (!opts.skipNav) {
        history.push('/tasks');
      }
    },
  };
}
