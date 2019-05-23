import { useState, useCallback } from 'react';
import { useOrbit } from 'react-orbitjs';
import useDebouncedCallback from 'use-debounce/lib/callback';

import { defaultOptions, attributesFor } from '@data';

import { TYPE_NAME as ORGANIZATION, OrganizationResource } from '@data/models/organization';
import { useCurrentUser } from '@data/containers/with-current-user';

import { useCurrentOrganization } from '~/data/containers/with-current-organization';

export interface IProvidedDataProps {
  searchResults: OrganizationResource[];
  searchTerm: string;
  selectOrganization: (id: string) => void;
  didTypeInSearch: (e: Event) => void;
}

interface INeededProps {
  toggle: () => void;
}

export function useOrgSwitcherData({ toggle }: INeededProps): IProvidedDataProps {
  const [searchTerm, setSearchTerm] = useState('');
  const { dataStore } = useOrbit();
  const { isSuperAdmin } = useCurrentUser();

  const {
    setCurrentOrganizationId,
    organizationsAvailableToUser: organizations,
  } = useCurrentOrganization();

  const [searchResults, setResults] = useState(organizations);

  const selectOrganization = (id) => () => {
    setCurrentOrganizationId(id);
    toggle();
  };

  // TODO: clean this up once
  //       https://github.com/orbitjs/orbit/pull/525
  //       is merged, where we'll be able to retrieve the query result
  //       without local filtering. (so we can skip the cache query step)
  const performSearch = useDebouncedCallback(
    async () => {
      const filters = [{ attribute: 'name', value: `like:${searchTerm}` }];

      if (!isSuperAdmin) {
        filters.push({ attribute: 'scope-to-current-user', value: 'isnull:' });
      }

      await dataStore.query((q) => q.findRecords(ORGANIZATION).filter(filters), defaultOptions());

      const records = await dataStore.cache.query((q) => q.findRecords(ORGANIZATION));
      // TODO: MAY need to do a local filter on organizations that the current user owns
      const filtered = records.filter((record) => {
        const { name } = attributesFor(record);
        if (!name) {
          return false;
        }

        return (name as string).toLowerCase().includes(searchTerm.toLowerCase());
      });

      setResults(filtered);
    },
    250,
    [searchTerm]
  );

  const didTypeInSearch = useCallback(
    (e) => {
      const searchTerm = e.target.value;

      setSearchTerm(searchTerm);
      performSearch();
    },
    [performSearch]
  );

  return { searchTerm, searchResults, didTypeInSearch, selectOrganization };
}
