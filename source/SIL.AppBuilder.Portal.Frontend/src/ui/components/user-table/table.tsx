import * as React from 'react';

import {
  UserResource,
  RoleResource,
} from '@data';

import { isEmpty } from '@lib/collection';
import { i18nProps } from '@lib/i18n';

import Header from './header';
import Row from './row';

import './user-table.scss';

interface IOwnProps {
  users: UserResource[];
  currentUser: UserResource;
  roles: RoleResource[];
}

type IProps =
  & IOwnProps
  & i18nProps;

export default class Table extends React.Component<IProps> {
  render() {

    const { users, roles, currentUser, t } = this.props;

    return (
      <table data-test-userstable className='ui table user-table' >
        <Header />
        <tbody>

          { users && users.map((user,index) => (
            <Row
              key={index}
              currentUser={currentUser}
              user={user}
              roles={roles} />
          ))}

          { isEmpty(users) && (
            <tr><td colSpan={5}>
              {t('users.noneFound')}
            </td></tr>
          ) }

        </tbody>
      </table>
    );
  }
}
