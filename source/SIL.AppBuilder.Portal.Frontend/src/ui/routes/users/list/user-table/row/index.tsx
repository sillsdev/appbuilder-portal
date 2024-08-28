import * as React from 'react';
import * as toast from '@lib/toast';
import { compareVia } from '@lib/collection';
import { compose, withProps, mapProps } from 'recompose';
import pick from 'lodash/pick';
import { Link } from 'react-router-dom';
import { Checkbox } from 'semantic-ui-react';
import { withData as withOrbit } from 'react-orbitjs';
import {
  UserResource,
  GroupResource,
  RoleResource,
  OrganizationResource,
  attributesFor,
  idFromRecordIdentity,
} from '@data';
import { withRole, isUserASuperAdmin } from '@data/containers/with-role';
import { ROLE } from '@data/models/role';
import {
  withDataActions,
  IProvidedProps as IActionProps,
} from '@data/containers/resources/user/with-data-actions';
import { withRelationships } from '@data/containers/with-relationship';
import { withTranslations, i18nProps } from '@lib/i18n';

import MultiGroupList from './multi-group-list';
import MultiRoleList from './multi-role-list';

export interface INeededProps {
  currentUser: UserResource;
  user: UserResource;
  roles: RoleResource[];
}

export interface IOwnProps {
  groups: GroupResource[];
  roles: RoleResource[];
  organizations: OrganizationResource[];
  userOrganizations: OrganizationResource[];
}

export type IProps = INeededProps & i18nProps & IActionProps & IOwnProps;

class Row extends React.Component<IProps> {
  getMessage = (nextState, type = 'success') => {
    const state = nextState ? 'lock' : 'unlock';

    return this.props.t(`users.operations.${state}.${type}`);
  };

  toggleLock = async (e) => {
    e.preventDefault();

    const { updateAttribute, user } = this.props;

    const currentLockedState = attributesFor(user).isLocked;
    const nextLockedState = !currentLockedState;

    try {
      await updateAttribute('isLocked', nextLockedState);

      toast.success(this.getMessage(nextLockedState));
    } catch (e) {
      console.error(e);
      toast.error(this.getMessage(nextLockedState, 'error'));
    }
  };

  render() {
    const { user, t, roles, organizations } = this.props;
    const { name, isLocked, email } = attributesFor(user);
    const userId = idFromRecordIdentity(user);

    const fullname = name || `(${t('profile.name')})`;
    const isActive = !isLocked;
    organizations.sort(compareVia((org) => attributesFor(org).name.toLowerCase()));

    return (
      <tr data-test-user-row={email || 'no-email-given'}>
        <td>
          <Link data-test-user-table-username to={`/users/${userId}/settings`}>
            {fullname}
          </Link>
        </td>
        <td data-test-role-selector>
          <MultiRoleList user={user} roles={roles} organizations={organizations} />
        </td>
        <td>
          <MultiGroupList user={user} organizations={organizations} />
        </td>
        <td>
          <Checkbox data-test-toggle-lock toggle onClick={this.toggleLock} checked={isActive} />
        </td>
      </tr>
    );
  }
}

export default compose<IProps, INeededProps>(
  withTranslations,
  withDataActions,
  // read from cache for active/lock toggle
  withOrbit(({ user }) => ({
    user: (q) => q.findRecord(user),
  })),
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
  withProps(({ currentUserOrganizations, userOrganizations, currentUser, dataStore }) => {
    let organizations = [];
    const isSuperAdmin = currentUser && isUserASuperAdmin(dataStore, currentUser);

    if (userOrganizations && userOrganizations.length > 0) {
      organizations = userOrganizations.filter(
        (org) => isSuperAdmin || currentUserOrganizations.some((o) => o.id === org.id)
      );
    }

    return { organizations };
  }),
  withRole(ROLE.OrganizationAdmin, {
    forAnyOrganization: (props: IProps) => {
      return props.organizations;
    },
  }),
  mapProps((allProps: any) => {
    const remainingProps = pick(allProps, [
      'user',
      'userOrganizations',
      'organizations',
      'updateAttribute',
      't',
      'roles',
    ]);

    return remainingProps;
  })
)(Row);
