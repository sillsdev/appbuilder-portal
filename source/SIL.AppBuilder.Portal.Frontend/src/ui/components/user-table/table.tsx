import * as React from 'react';
import { compose } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';

import { GroupAttributes } from '@data/models/group';
import Header from './header';
import { isEmpty } from '@lib/collection';
import Row from './row';
import { UserAttributes } from '@data/models/user';
import { USERS_TYPE, GROUPS_TYPE } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';

import './user-table.scss';

interface IOwnProps {
  users: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
}

type IProps =
  & IOwnProps
  & i18nProps;

class Table extends React.Component<IProps> {
  render() {
    const { users, groups, t } = this.props;

    return (
      <table data-test-users className= 'ui table user-table' >
        <Header />
        <tbody>

          { users && users.map((user,index) => (
            <Row key={index} user={user} groups={groups} />
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
  withTranslations
)(Table);
