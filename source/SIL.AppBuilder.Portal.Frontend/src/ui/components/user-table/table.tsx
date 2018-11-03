import * as React from 'react';
import { compose } from 'recompose';

import {
  UserResource,
  RoleResource,
} from '@data';

import { withRoles } from '@data/containers/resources/role';

import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

import Header from './header';
import Row from './row';

import './user-table.scss';
import { withCurrentUser } from '@data/containers/with-current-user';

interface IOwnProps {
  users: UserResource[];
  currentUser: UserResource;
  roles: RoleResource[];
}

type IProps =
  & IOwnProps
  & i18nProps;

class Table extends React.Component<IProps> {
  render() {

    const { users, roles, currentUser, t } = this.props;

    return (
      <table data-test-users className= 'ui table user-table' >
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

export default compose(
  withTranslations,
  withCurrentUser(),
  withRoles(),
)(Table);
