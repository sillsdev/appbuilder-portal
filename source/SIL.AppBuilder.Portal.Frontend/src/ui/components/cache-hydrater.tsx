import { useCurrentUser } from '~/data/containers/with-current-user';

import { useOrbit, pushPayload } from 'react-orbitjs';
import { useEffect, useState } from 'react';

import { defaultHeaders } from '~/lib/fetch';

import { PageLoader } from './loaders';

import React from 'react';

export function CacheHydrater({ children }) {
  const { dataStore } = useOrbit();
  const { isSuperAdmin } = useCurrentUser();
  const [needsSuperAdminData, setNeedsSuperAdminData] = useState(false);

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

        await pushPayload(dataStore, json);
        setNeedsSuperAdminData(false);
      })();
    }
  }, [needsSuperAdminData]);

  if (!isSuperAdmin) {
    return children;
  }

  if (needsSuperAdminData) {
    return <PageLoader />;
  }

  return children;
}
