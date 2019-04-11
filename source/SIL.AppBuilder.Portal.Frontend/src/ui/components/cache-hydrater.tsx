import { useCurrentUser } from '~/data/containers/with-current-user';

import { canDoEverything } from '~/data/containers/with-role';

import { useOrbit, pushPayload } from 'react-orbitjs';
import { useEffect, useState } from 'react';

import { defaultHeaders } from '~/lib/fetch';

export function CacheHydrater() {
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();
  const [needsSuperAdminData, setNeedsSuperAdminData] = useState();

  const isSuperAdmin = currentUser && canDoEverything(dataStore, currentUser);

  useEffect(() => {
    if (isSuperAdmin) {
      setNeedsSuperAdminData(true);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (needsSuperAdminData) {
      (async () => {
        const response = await fetch('/api/organizations', {
          headers: defaultHeaders(),
        });
        const json = await response.json();

        pushPayload(dataStore, json);
      })();
    }
  }, [needsSuperAdminData]);

  return null;
}
