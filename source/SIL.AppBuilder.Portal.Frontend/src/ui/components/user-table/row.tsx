import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Radio } from 'semantic-ui-react';
import { ResourceObject } from 'jsonapi-typescript';

import { UserAttributes } from '@data/models/user';
import GroupDropdown from '@ui/components/inputs/multi-group-select';

import { USERS_TYPE, GROUP_MEMBERSHIPS_TYPE } from '@data';

export interface IOwnProps {
  user: ResourceObject<USERS_TYPE, UserAttributes>;
  toggleLock: (user: ResourceObject<USERS_TYPE, UserAttributes>) => void;
  updateUserGroups: (user: ResourceObject<USERS_TYPE, UserAttributes>,groups: ResourceObject<GROUPS_TYPE, GroupAttributes>) => void;
}

export type IProps =
  & i18nProps
  & IOwnProps;

class Row extends React.Component<IProps> {

  render() {
    const { user: userData, t, toggleLock } = this.props;
    const user = userData.attributes || {} as UserAttributes;

    const firstName = user.givenName || `(${t('profile.firstName')})`;
    const lastName = user.familyName || `(${t('profile.lastName')})`;
    const isActive = !user.isLocked;

    return (
      <tr>
        <td>
          <Link data-test-user-table-username to={`/users/${userData.id}/edit`}>
            {firstName} {lastName}
          </Link>
        </td>
        <td>Roles listed here</td>
        <td>
          <GroupDropdown user={this.props.user} />
        </td >
        <td>
          <Radio
            data-test-toggle-lock
            toggle
            onChange={_ => toggleLock(userData)}
            checked={isActive} />
        </td>
      </tr >
    );
  }
}

export default compose(
  translate('translations')
)(Row);
