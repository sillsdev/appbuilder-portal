import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { useTranslations } from '@lib/i18n';

interface INeededProps {
  selected: Id;
  onSelect: (e: Event, { value: string }) => void;
  disableSelection?: boolean;
  groupOptions: {
    text: string;
    value: string;
  }[];
}

export default function GroupSelectDisplay({
  selected,
  groupOptions,
  onSelect,
  disableSelection,
}: INeededProps) {
  const { t } = useTranslations();

  if (groupOptions.length === 0) {
    return (
      <span className='text-danger' data-test-no-available-groups>
        {t('project.noAvailableGroups')}
      </span>
    );
  }

  return (
    <Dropdown
      data-test-group-select
      disabled={disableSelection || false}
      scrolling
      options={groupOptions}
      value={selected}
      onChange={onSelect}
    />
  );
}
