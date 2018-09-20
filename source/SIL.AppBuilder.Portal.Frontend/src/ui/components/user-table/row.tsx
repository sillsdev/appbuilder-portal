import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { Radio } from 'semantic-ui-react';
import { ResourceObject } from 'jsonapi-typescript';
import { withData as withOrbit } from 'react-orbitjs';


import { USERS_TYPE, GROUPS_TYPE, attributesFor, idFromRecordIdentity } from '@data';
import { withDataActions, IProvidedProps as IActionProps } from '@data/containers/resources/user/with-data-actions';
import { UserAttributes } from '@data/models/user';
import { GroupAttributes } from '@data/models/group';
import { withTranslations, i18nProps } from '@lib/i18n';


export interface IOwnProps {
  user: ResourceObject<USERS_TYPE, UserAttributes>;
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
}

export type IProps =
  & i18nProps
  & IActionProps
  & IOwnProps;

class Row extends React.Component<IProps> {
  getMessage = (nextState, type = 'success') => {
    const state = nextState ? 'lock' : 'unlock';

    return this.props.t(`users.operations.${state}.${type}`);
  }

  toggleLock = async () => {
    const { updateAttribute, user } = this.props;

    const currentLockedState = user.attributes.isLocked;
    const nextLockedState = !currentLockedState;

    try {
      await updateAttribute('isLocked', nextLockedState);

      toast.success(this.getMessage(nextLockedState));
    } catch(e) {
      console.error(e);
      toast.error(this.getMessage(nextLockedState,'error'));
    }
  }

  render() {
    const { user: userData, t } = this.props;
    const user = attributesFor(userData) as UserAttributes;
    const userId = idFromRecordIdentity(userData as any);

    const firstName = user.givenName || `(${t('profile.firstName')})`;
    const lastName = user.familyName || `(${t('profile.lastName')})`;
    const isActive = !user.isLocked;

    return (
      <tr>
        <td>
          <Link data-test-user-table-username to={`/users/${userId}/edit`}>
            {firstName} {lastName}
          </Link>
        </td>
        <td>Roles listed here</td>
        <td>
          Groups Here
          {/* <GroupDropdown
            items={groups.map(g => ({ id: g.id, value: g.attributes.name }))}
            selected={user.groups.map(g => ({ id: g.id, value: g.name }))}
          />
          */}
        </td >
        <td>
          <Radio
            data-test-toggle-lock
            toggle
            onChange={this.toggleLock}
            checked={isActive} />
        </td>
      </tr >
    );
  }
}

export default compose(
  withTranslations,
  withDataActions,
  withOrbit(({ user }) => ({ user: q => q.findRecord(user) }))
)(Row);
