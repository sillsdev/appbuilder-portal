import * as React from 'react';

import Header from './header';
import Row from './row';

import './user-table.scss';

interface IOwnProps {
  users: any[],
  groups: any[]
}

export default class Table extends React.Component<IOwnProps> {

  render() {

    const { users, groups } = this.props;

    return (
      <table className= 'ui table user-table' >
        <Header />
        <tbody>
        {
          users && users.map((user,index) => (
            <Row key={index} user={user} groups={groups} />
          ))
        }
        </tbody>
      </table>
    );
  }
}