import * as React from 'react';
import { compose, withProps } from 'recompose';
import { compareVia } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withRelationships } from '@data/containers/with-relationship';

import { RequireRole } from '~/ui/components/authorization';

import { ROLE } from '~/data/models/role';

import { UserResource } from '@data/models/user';

import ActiveGroupsDisplay from './active-groups-display';
import GroupSelect from './group-select';

import {
  GroupResource,
  OrganizationResource,
  attributesFor,
  idFor,
  relationshipFor,
  recordsWithIdIn,
} from '@data';

export const pathName = '/users/:userId/editsettings/settings/groups';

export interface INeededProps {
  user: UserResource;
  organizations: OrganizationResource[];
}
interface IOwnProps {
  groups: GroupResource[];
  currentUser: UserResource;
}

type IProps = INeededProps & i18nProps & IOwnProps;

class GroupsRoute extends React.Component<IProps> {
  render() {
    const { organizations, user, groups } = this.props;
    organizations.sort(compareVia((org) => attributesFor(org).name.toLowerCase()));
    return organizations.map((organization) => {
      const organizationName = attributesFor(organization).name.toUpperCase();
      const groupCheckboxesProps = {
        organization,
        user,
      };
      const groupProps = {
        organization,
        user,
        groups,
      };

      return (
        <div data-test-groups-active key={organization.id}>
          <div className='p-t-md p-b-sm'>
            <span className='bold fs-14'>{organizationName}</span>
          </div>
          <RequireRole
            roleName={ROLE.OrganizationAdmin}
            forOrganization={organization}
            componentOnForbidden={() => {
              return (
                <span className='item'>
                  <ActiveGroupsDisplay {...groupProps} />
                </span>
              );
            }}
          >
            <GroupSelect {...groupCheckboxesProps} />
          </RequireRole>
        </div>
      );
    });
  }
}

export default compose(
  withTranslations,
  withRelationships(({ user }) => {
    return {
      allUserGroups: [user, 'groupMemberships', 'group'],
    };
  }),
  // Filter groups that are visible for the current user
  withProps(({ allUserGroups, organizations }) => {
    let groups = [];

    if (allUserGroups) {
      groups = allUserGroups.filter((group) => {
        const orgId = idFor(relationshipFor(group, 'owner'));

        return recordsWithIdIn(organizations, orgId).length > 0;
      });
    }

    return { groups };
  })
)(GroupsRoute);
