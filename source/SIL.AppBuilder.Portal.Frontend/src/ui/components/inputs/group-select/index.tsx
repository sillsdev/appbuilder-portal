import React from 'react';
import { useEffect, useCallback } from 'react';
import { attributesFor } from 'react-orbitjs/dist';
import { compareVia } from '@lib/collection';
import { RectLoader } from '@ui/components/loaders';

import Display from './display';
import { useScopeGroupData } from './with-data';

import { OrganizationResource } from '~/data';

interface INeededProps {
  scopeToCurrentUser?: boolean;
  scopeToOrganization?: OrganizationResource;
  selected: Id;
  onChange: (groupId: Id) => void;
}

export default function GroupSelect({
  selected,
  scopeToCurrentUser,
  scopeToOrganization,
  onChange,
}: INeededProps) {
  const { groups, disableSelection } = useScopeGroupData({
    selected,
    scopeToCurrentUser,
    scopeToOrganization,
  });

  useEffect(() => {
    // Have to put in the odd or case because the organization name comes up as a group and initially doesn't
    // have a name attribute
    if (groups) {
      groups.sort(compareVia((group) => (attributesFor(group).name || '').toLowerCase()));
      if (!selected && groups && groups.length > 0) {
        const firstId = groups[0].id;

        onChange(firstId);
      }
    }
  }, [selected, groups, onChange]);

  const onSelect = useCallback(
    (e, { value }) => {
      e.preventDefault();

      if (value === selected) {
        return;
      }

      onChange(value);
    },
    [selected, onChange]
  );

  if (!groups) {
    return (
      <div className='flex justify-content-center w-100'>
        <RectLoader />
      </div>
    );
  }
  groups.sort(compareVia((group) => (attributesFor(group).name || '').toLowerCase()));
  const groupOptions = (groups || [])
    .filter((group) => attributesFor(group).name)
    .map((group) => ({
      text: attributesFor(group).name,
      value: group.id,
    }));

  return (
    <Display
      {...{
        groupOptions,
        disableSelection,
        selected,
        onSelect,
      }}
    />
  );
}
