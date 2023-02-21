import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';

import { attributesFor } from '@data';

import { name } from '@data/models/user';

import { IProps } from './types';

export default class AuthorSelectDisplay extends React.Component<IProps> {
  onSelect = (e, { value }) => {
    e.preventDefault();

    const { onChange, selected } = this.props;

    if (value === selected) {
      return;
    }

    onChange(value);
  };

  render() {
    const { users, selected, disableSelection } = this.props;

    const userOptions = users
      .filter((user) => user.attributes)
      .map((user) => {
        const attrs = attributesFor(user);

        return {
          text: name(attrs),
          value: user.id,
        };
      });

    const userOptionsSorted = userOptions.sort((a, b) => {
      let ta = a.text.toLowerCase(),
        tb = b.text.toLowerCase();

      if (ta < tb) return -1;
      if (ta > tb) return 1;
      return 0;
    });

    return (
      <Dropdown
        data-test-user-select
        disabled={disableSelection || false}
        scrolling
        options={userOptionsSorted}
        value={selected}
        onChange={this.onSelect}
      />
    );
  }
}
