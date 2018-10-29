import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { Radio } from 'semantic-ui-react';
import { withData as withOrbit } from 'react-orbitjs';

import {
  UserResource, GroupResource, RoleResource,
  attributesFor, idFromRecordIdentity
} from '@data';
import { withDataActions, IProvidedProps as IActionProps } from '@data/containers/resources/user/with-data-actions';

import { withTranslations, i18nProps } from '@lib/i18n';

import RoleSelect from './role-select';
import GroupSelect from './group-select';


export interface IOwnProps {
  user: UserResource;
  groups: GroupResource[];
  roles: RoleResource[];
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

    const currentLockedState = attributesFor(user).isLocked;
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
    const { user, t, roles } = this.props;
    const { givenName, familyName, isLocked } = attributesFor(user);
    const userId = idFromRecordIdentity(user);

    const firstName = givenName || `(${t('profile.firstName')})`;
    const lastName = familyName || `(${t('profile.lastName')})`;
    const isActive = !isLocked;

    return (
      <tr>
        <td>
          <Link data-test-user-table-username to={`/users/${userId}/edit`}>
            {firstName} {lastName}
          </Link>
        </td>
        <td />
        <td>
          <GroupSelect user={user} />
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
  withOrbit(({ user }) => ({ user: q => q.findRecord(user) })),
  // TODO: use with relationships here to get the users organizations
)(Row);
