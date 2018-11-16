import * as React from 'react';
import * as toast from '@lib/toast';
import { compose, withProps } from 'recompose';
import { Link } from 'react-router-dom';
import { Radio } from 'semantic-ui-react';
import { withData as withOrbit } from 'react-orbitjs';

import {
  UserResource, GroupResource, RoleResource, OrganizationResource,
  attributesFor, idFromRecordIdentity, withLoader,
} from '@data';
import { withRole } from '@data/containers/with-role';
import { ROLE } from '@data/models/role';
import { UserAttributes } from '@data/models/user';
import { withDataActions, IProvidedProps as IActionProps } from '@data/containers/resources/user/with-data-actions';
import { withRelationships } from '@data/containers/with-relationship';

import { withTranslations, i18nProps } from '@lib/i18n';

import MultiGroupSelect from './multi-group-select';
import MultiRoleSelect from './multi-role-select';

export interface INeededProps {
  currentUser: UserResource;
  user: UserResource;
  groups: GroupResource[];
  roles: RoleResource[];
}

export interface IOwnProps {
  roles: RoleResource[];
  organizations: OrganizationResource[];
}

export type IProps =
  & INeededProps
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
    const { user, t, roles, organizations } = this.props;
    const { givenName, familyName, isLocked } = attributesFor(user);
    const userId = idFromRecordIdentity(user);

    const firstName = givenName || `(${t('profile.firstName')})`;
    const lastName = familyName || `(${t('profile.lastName')})`;
    const isActive = !isLocked;

    return (
      <tr data-test-user-row>
        <td>
          <Link data-test-user-table-username to={`/users/${userId}/edit`}>
            {firstName} {lastName}
          </Link>
        </td>
        <td data-test-role-selector>
          <MultiRoleSelect
            user={user}
            roles={roles}
            organizations={organizations} />
        </td>
        <td>
          <MultiGroupSelect
            user={user}
            organizations={organizations} />
        </td >
        <td>
          <Radio
            data-test-toggle-lock
            toggle
            onChange={this.toggleLock}
            checked={isActive} />
        </td>
      </tr>
    );
  }
}

export default compose<IProps, INeededProps>(
  withTranslations,
  withDataActions,
  // read from cache for active/lock toggle
  withOrbit(({ user }) => ({ user: q => q.findRecord(user) })),
  withRelationships(({ user, currentUser }) => {
    return {
      userOrganizations: [user, 'organizationMemberships', 'organization'],
      currentUserOrganizations: [currentUser, 'organizationMemberships', 'organization'],
    };
  }),
  // filter out the organizations that the currentUser doesn't have access to
  // the organizations a user is a member of is not private knowledge,
  // but it doesn't make sense to display roles for organizations the current
  // user doesn't care about / isn't a member of
  withProps(({ currentUserOrganizations, userOrganizations }) => {
    let organizations = [];

    if (userOrganizations && userOrganizations.length > 0) {
      organizations = userOrganizations.filter(
        org => currentUserOrganizations.some(o => o.id === org.id)
      );
    }

    console.log('orgs', userOrganizations, currentUserOrganizations);
    return { organizations };
  }),
  // TODO: look here -- for some reason when all organizations are selected
  // organizations is an empty array
  withRole(ROLE.OrganizationAdmin, {
    forAnyOrganization: (props: IProps) => props.organizations,
  })
)(Row);
