import { useCurrentUser } from '~/data/containers/with-current-user';

import { useOrbit, pushPayload } from 'react-orbitjs';
import { useEffect, useState } from 'react';

import { defaultHeaders } from '~/lib/fetch';

export function CacheHydrater() {
  const { dataStore } = useOrbit();
  const { isSuperAdmin } = useCurrentUser();
  const [needsSuperAdminData, setNeedsSuperAdminData] = useState();

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
