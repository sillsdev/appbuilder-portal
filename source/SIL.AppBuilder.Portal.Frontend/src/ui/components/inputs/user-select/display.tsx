import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';

import { attributesFor } from '@data';
import { name } from '@data/models/user';

import { IProvidedProps as IDataProps } from './with-data';

interface IOwnProps {
  selected: Id;
  onChange: (userId: Id) => void;
  disableSelection?: boolean;
}

type IProps =
& IOwnProps
& IDataProps;

export default class UserSelectDisplay extends React.Component<IProps> {
  onSelect = (e, { value }) => {
    e.preventDefault();

    const { onChange } = this.props;

    onChange(value);
  }

  render() {
    const { users, selected, disableSelection } = this.props;

    const userOptions = users
      .map(user => {
        const attrs = attributesFor(user);

        return {
          text: name(attrs),
          value: user.id
        };
      });

    const selectedUser = users.find(user => user.id === selected);
    const selectedText = name(attributesFor(selectedUser));

    return (
      <Dropdown
        data-test-user-select
        disabled={disableSelection || false}
        options={userOptions}
        text={selectedText}
        onChange={this.onSelect}
      />
    );
  }
}
