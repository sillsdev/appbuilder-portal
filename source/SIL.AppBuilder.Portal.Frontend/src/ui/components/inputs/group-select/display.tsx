import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';

import { attributesFor } from '@data';

import { i18nProps } from '@lib/i18n';

import { IProvidedProps as IDataProps } from './with-data';

interface IOwnProps {
  selected: Id;
  onChange: (groupId: Id) => void;
  disableSelection?: boolean;
}

type IProps = IOwnProps & i18nProps & IDataProps;

export default class GroupSelectDisplay extends React.Component<IProps> {
  componentDidMount() {
    this.defaultToFirst();
  }

  componentDidUpdate() {
    this.defaultToFirst();
  }

  defaultToFirst = () => {
    const { selected, groups, onChange } = this.props;

    if (!selected && groups && groups.length > 0) {
      const firstId = groups[0].id;

      onChange(firstId);
    }
  };

  onSelect = (e, { value }) => {
    e.preventDefault();

    const { onChange, selected } = this.props;

    if (value === selected) {
      return;
    }

    onChange(value);
  };

  render() {
    const { groups, selected, disableSelection, t } = this.props;

    const groupOptions = groups
      .filter((group) => attributesFor(group).name)
      .map((group) => ({
        text: attributesFor(group).name,
        value: group.id,
      }));

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
        options={groupOptions}
        value={selected}
        onChange={this.onSelect}
      />
    );
  }
}
