import * as React from 'react';
import { UserResource, RoleResource, attributesFor } from '@data';
import { isEmpty, areResourceListsEqual, compareVia } from '@lib/collection';
import { i18nProps } from '@lib/i18n';

import Header from './header';
import Row from './row';

import './user-table.scss';

interface IOwnProps {
  users: UserResource[];
  currentUser: UserResource;
  roles: RoleResource[];
}

type IProps = IOwnProps & i18nProps;

export default class Table extends React.Component<IProps> {
  shouldComponentUpdate(nextProps, nextState) {
    const nextUsers = nextProps.users;
    const users = this.props.users;

    return !areResourceListsEqual(nextUsers, users);
  }

  render() {
    const { users, roles, currentUser, t } = this.props;
    // Took off the toLowerCase for this one because ten tests failed with
    // an obscure Polly error when it was left in.
    users.sort(compareVia((user) => attributesFor(user).name));
    return (
      <table data-test-userstable className='ui table user-table'>
        <Header />
        <tbody>
          {users &&
            users.map((user) => (
              <Row key={user.id} currentUser={currentUser} user={user} roles={roles} />
            ))}

          {isEmpty(users) && (
            <tr>
              <td colSpan={5}>{t('users.noneFound')}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}
