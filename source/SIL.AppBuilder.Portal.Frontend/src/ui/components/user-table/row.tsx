import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Radio } from 'semantic-ui-react';

import { UserAttributes } from '@data/models/user';
import { GroupAttributes } from '@data/models/group';
import GroupDropdown from '@ui/components/inputs/multi-group-select';
import { withGroups }  from './with-groups';

export interface IOwnProps {
  user: JSONAPI<UserAttributes>;
  groups: Array<JSONAPI<GroupAttributes>>;
  toggleLock: (user: JSONAPI<UserAttributes>) => void;
}

export type IProps =
  & i18nProps
  & IOwnProps;

class Row extends React.Component<IProps> {

  render() {
    const { user: userData, t, toggleLock, groups } = this.props;
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
          <GroupDropdown selectedGroups={groups.map(g => g.id)} />
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
  translate('translations'),
  withGroups()
)(Row);
