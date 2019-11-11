import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { compareVia } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';
import {
  withDataActions,
  IProvidedProps,
} from '@data/containers/resources/group/with-data-actions';
import { withRelationships } from '@data/containers/with-relationship';
import { Toggle, toggleCreator } from 'react-state-helpers';

import Form from './form';
import List from './list';
import GroupSelect from './group-select';

import { withLoader, GroupResource, OrganizationResource, attributesFor, idFor, relationshipFor, recordsWithIdIn } from '@data';
import { UserResource } from '@data/models/user';

export const pathName = '/users/:userId/newedit/settings/groups';

export interface IProps {
  user: UserResource;
  organizations: OrganizationResource[];
}
interface IState {
  showForm: boolean;
  groupToEdit: GroupResource;
}

class GroupsRoute extends React.Component<IProps, IState> {
  render() {
    const { organizations, user } = this.props;
    organizations.sort(compareVia((org) => attributesFor(org).name.toLowerCase()));
    return organizations.map((organization) => {
      const organizationName = attributesFor(organization).name.toUpperCase();
      const groupCheckboxesProps = {
        organization,
        user,
      };

      return (
        <div data-test-groups-active key={organization.id}>
          <div className='p-t-md p-b-sm'>
            <span className='bold fs-14'>{organizationName}</span>
          </div>
          <GroupSelect {...groupCheckboxesProps} />
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