import * as React from 'react';

import { UserAttributes } from '@data/models/user';
import { GroupAttributes } from '@data/models/group';
import { isEmpty } from '@lib/collection';

import Header from './header';
import Row from './row';

import './user-table.scss';

interface IOwnProps {
  users: Array<JSONAPI<UserAttributes>>;
  groups: Array<JSONAPI<GroupAttributes>>;
}

type IProps =
  & IOwnProps;

class Table extends React.Component<IProps> {
  render() {
    const { users, groups } = this.props;

    return (
      <table className= 'ui table user-table' >
        <Header />
        <tbody>

          { users && users.map((user,index) => (
            <Row key={index} user={user} groups={groups} />
          ))}

        </tbody>
      </table>
    );
  }
}

export default Table;
