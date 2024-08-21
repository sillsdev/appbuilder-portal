import * as React from 'react';
import * as toast from '@lib/toast';
import { compose, withProps, mapProps } from 'recompose';
import { match as Match } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { withData as withOrbit, ILegacyProvidedProps } from 'react-orbitjs';
import NotFound from '@ui/routes/errors/not-found';
import pick from 'lodash/pick';
import {
  query,
  GroupResource,
  RoleResource,
  OrganizationResource,
  withLoader,
  buildFindRecord,
  buildOptions,
  update,
} from '@data';
import { withRole, isUserASuperAdmin } from '@data/containers/with-role';
import { ROLE } from '@data/models/role';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withRelationships } from '@data/containers/with-relationship';
import { UserAttributes, TYPE_NAME, UserResource } from '@data/models/user';
import { withTranslations, i18nProps } from '@lib/i18n';
import {
  withDataActions,
  IProvidedProps as IDataActionsProps,
} from '@data/containers/resources/organization/with-data-actions';

import ProfileRoute, { pathName as profilePath } from './profile';
import GroupsRoute, { pathName as groupsPath } from './groups';
import RolesRoute, { pathName as rolesPath } from './roles';
import Navigation from './navigation';

export const pathName = '/users/:userId/settings';

export interface Params {
  userId: string;
}
export interface IOwnProps {
  groups: GroupResource[];
  organizations: OrganizationResource[];
  userOrganizations: OrganizationResource[];
  roles: RoleResource[];
}
interface PassedProps {
  match: Match<Params>;
}

interface QueriedProps {
  user: UserResource;
}

export type IProps = PassedProps &
  QueriedProps &
  i18nProps &
  ILegacyProvidedProps &
  IDataActionsProps &
  IOwnProps;

class SettingsRoute extends React.Component<IProps> {
  updateProfile = async (attributes: UserAttributes): Promise<void> => {
    const { t, user, dataStore } = this.props;

    try {
      await update(dataStore, user, { attributes });
      toast.success(t('profile.updated'));
    } catch (e) {
      toast.error(e);
    }
  };

  render() {
    const { user, t, organizations, roles } = this.props;
    if (!user) {
      return (
        <div className='m-t-xl'>
          <NotFound />
        </div>
      );
    }

    const profileSettingsProps = {
      user,
      onSubmit: this.updateProfile,
    };
    const groupSettingsProps = {
      user,
      organizations,
    };
    const roleSettingsProps = {
      user,
      organizations,
      roles,
    };

    return (
      <div className='ui container' data-test-editsettings-manager>
        <h2 className='page-heading page-heading-border-sm'>
          {t('users.settingsTitle')}: {user && user.attributes.name}
        </h2>
        <div className='flex-column-xs flex-row-sm align-items-start-sm'>
          <Navigation />

          <div className='m-l-lg flex-grow'>
            <Switch>
              <Route
                exact
                path={profilePath}
                render={(routeProps) => <ProfileRoute {...routeProps} {...profileSettingsProps} />}
              />
              <Route
                path={groupsPath}
                render={(routeProps) => <GroupsRoute {...routeProps} {...groupSettingsProps} />}
              />
              <Route
                path={rolesPath}
                render={(routeProps) => <RolesRoute {...routeProps} {...roleSettingsProps} />}
              />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withDataActions,
  withTranslations,
  query(({ match: { params: { userId } } }) => ({
    cacheKey: [`user-${userId}`],
    user: [
      (q) => buildFindRecord(q, TYPE_NAME, userId),
      buildOptions({
        include: [
          'organization-memberships.organization',
          'group-memberships.group',
          'user-roles.role',
        ],
      }),
    ],
    allOrganizations: [
      (q) => q.findRecords('organization'),
      buildOptions({
        include: ['groups'],
      }),
    ],
    allRoles: [
      (q) => q.findRecords('role'),
      buildOptions({
        include: ['user-roles'],
      }),
    ],
  })),
  withCurrentUserContext,
  withLoader(({ user }) => !user),
  withOrbit(({ user }) => ({
    user: (q) => q.findRecord(user),
    organizationMemberships: (q) => q.findRecords('organizationMembership'),
    groups: (q) => q.findRecords('group'),
    roles: (q) => q.findRecords('role'),
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
      'dataStore',
    ]);

    return remainingProps;
  })
)(SettingsRoute);
