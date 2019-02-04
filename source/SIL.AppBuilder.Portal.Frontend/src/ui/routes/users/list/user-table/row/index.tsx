import * as React from 'react';
import * as toast from '@lib/toast';
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
  withLoader,
} from '@data';

import { withRole } from '@data/containers/with-role';
import { ROLE } from '@data/models/role';
import {
  withDataActions,
  IProvidedProps as IActionProps,
} from '@data/containers/resources/user/with-data-actions';
import { withRelationships } from '@data/containers/with-relationship';
import { withTranslations, i18nProps } from '@lib/i18n';
import { areResourcesEqual } from '@lib/collection';

import MultiGroupSelect from './multi-group-select';
import MultiRoleSelect from './multi-role-select';

export interface INeededProps {
  currentUser: UserResource;
  user: UserResource;
  roles: RoleResource[];
}

export interface IOwnProps {
  groups: GroupResource[];
  roles: RoleResource[];
  organizations: OrganizationResource[];
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
    const { givenName, familyName, isLocked, email } = attributesFor(user);
    const userId = idFromRecordIdentity(user);

    const firstName = givenName || `(${t('profile.firstName')})`;
    const lastName = familyName || `(${t('profile.lastName')})`;
    const isActive = !isLocked;

    return (
      <tr data-test-user-row={email || 'no-email-given'}>
        <td>
          <Link data-test-user-table-username to={`/users/${userId}/edit`}>
            {firstName} {lastName}
          </Link>
        </td>
        <td data-test-role-selector>
          <MultiRoleSelect user={user} roles={roles} organizations={organizations} />
        </td>
        <td>
          <MultiGroupSelect user={user} organizations={organizations} />
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
  withProps(({ currentUserOrganizations, userOrganizations }) => {
    let organizations = [];

    if (userOrganizations && userOrganizations.length > 0) {
      organizations = userOrganizations.filter((org) =>
        currentUserOrganizations.some((o) => o.id === org.id)
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
