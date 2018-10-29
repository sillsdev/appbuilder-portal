import * as React from 'react';
import { compose } from 'recompose';

import {
  UserResource,
  GroupResource,
  RoleResource,
} from '@data';

import { withRoles } from '@data/containers/resources/role';

import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

import Header from './header';
import Row from './row';

import './user-table.scss';

interface IOwnProps {
  users: UserResource[];
  roles: RoleResource[];
}

type IProps =
  & IOwnProps
  & i18nProps;

class Table extends React.Component<IProps> {
  render() {
    const { users, groups, roles, t } = this.props;

    return (
      <table data-test-users className= 'ui table user-table' >
        <Header />
        <tbody>

          { users && users.map((user,index) => (
            <Row
              key={index}
              user={user}
              groups={groups}
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
  withRoles(),
)(Table);
