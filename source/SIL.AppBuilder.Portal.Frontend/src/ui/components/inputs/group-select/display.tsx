import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';

import { attributesFor } from '@data';

import { IProvidedProps as IDataProps } from './with-data';

interface IOwnProps {
  selected: Id;
  onChange: (groupId: Id) => void;
}

type IProps =
& IOwnProps
& IDataProps;

export default class GroupSelectDisplay extends React.Component<IProps> {
  onSelect = (e, { value }) => {
    e.preventDefault();

    const { onChange } = this.props;

    onChange(value);
  }

  render() {
    const { groups, selected } = this.props;

    const groupOptions = groups.map(group => ({
      text: attributesFor(group).name,
      value: group.id
    }));

    return (
      <Dropdown
        data-test-group-select
        inline
        options={groupOptions}
        defaultvalue={selected}
        onChange={this.onSelect}
      />
    );
  }
}
