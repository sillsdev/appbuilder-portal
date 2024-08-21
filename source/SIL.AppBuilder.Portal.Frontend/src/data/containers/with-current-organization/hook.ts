import { useSelector, useDispatch } from 'react-redux';
import { useOrbit, localIdFromRecordIdentity, pushPayload } from 'react-orbitjs/dist';
import _ from 'lodash';
import Store from '@orbit/store';
import { useEffect, useMemo } from 'react';

import { retrieveRelation } from '../with-relationship';
import { useCurrentUser } from '../with-current-user';

import { useRouter } from '~/lib/hooks';
import { setCurrentOrganization } from '~/redux-store/data';
import { optimistic, get, defaultHeaders } from '~/lib/fetch';

export function useCurrentOrganization() {
  const { history } = useRouter();
  const { currentUser, isSuperAdmin } = useCurrentUser();
  const {
    dataStore,
    subscriptions: { all },
  } = useOrbit({
    all: (q) => q.findRecords('organization'),
  });
  const dispatch = useDispatch();
  const { currentOrganizationId } = useSelector((x: any) => x.data);

  const currentUserOrganizations = retrieveRelation(dataStore, [
    currentUser,
    'organizationMemberships',
    'organization',
  ]);

  let organizationsAvailableToUser = currentUserOrganizations;

  if (isSuperAdmin && all) {
    organizationsAvailableToUser = _.uniqBy([...currentUserOrganizations, ...all], (org) => org.id);
  }

  const localId = localIdFromRecordIdentity(dataStore, {
    type: 'organization',
    id: currentOrganizationId,
  });

  let currentOrganization = useMemo(() => {
    try {
      if (currentOrganizationId) {
        return dataStore.cache.query((q) => q.findRecord({ type: 'organization', id: localId }));
      }
    } catch (e) {
      // if the current user is a super admin, this  org has not yet
      // been added to the cache
      console.warn(`org not found for ${currentOrganizationId}`, e);
    }
  }, [currentOrganizationId, dataStore.cache, localId]);

  const allOrgsSelected = '' === currentOrganizationId;
  const isInSelectedOrg = currentUserOrganizations.map((o) => o.id).includes(localId);

  useEffect(() => {
    if (isSuperAdmin && !isInSelectedOrg) {
      fetchDataForOrg(dataStore, currentOrganizationId);
    }
  }, [currentOrganization, isSuperAdmin, currentOrganizationId, isInSelectedOrg, dataStore]);

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

      fetchDataForOrg(dataStore, id);
    },
  };
}

function fetchDataForOrg(dataStore: Store, id: string) {
  const loadData = async (resource) =>
    pushPayload(
      dataStore,
      await optimistic(() =>
        get(`/api/${resource}`, {
          headers: {
            ...defaultHeaders(),
            ['Organization']: id,
          },
        })
      )
    );

  loadData('groups');
}
