import * as React from 'react';

import { UserAttributes } from '@data/models/user';
import { GroupAttributes } from '@data/models/group';
import GroupDropdown from './dropdown';

export interface IProps {
  user: JSONAPI<UserAttributes>,
  groups: JSONAPI<GroupAttributes>[]
}

export default class Row extends React.Component<IProps> {
  render() {
    const { user: data, groups } = this.props;
    const { attributes: user } = data;

    return (
      <tr>
        <td>{`${user.firstName} ${user.lastName}`}</td >
        <td>{`${user.role.name}`}</td >
        <td>
          <GroupDropdown
            items={groups.map(g => ({ id: g.id, value: g.attributes.name }))}
            selected={user.groups.map(g => ({ id: g.id, value: g.name }))}
          />
        </td >
        <td></td >
      </tr >
    );
  }
}