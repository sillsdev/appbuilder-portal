import * as React from 'react';
import { compose, withProps } from 'recompose';

import { GroupResource, UserResource, relationshipFor, idFor, recordsWithIdIn } from '@data';

import { OrganizationResource } from '@data';

import { withRelationships } from '@data/containers/with-relationship';
import { withTranslations, i18nProps } from '@lib/i18n';

import GroupListByOrganization from './group-list-by-organization';

interface INeededProps {
  user: UserResource;
  organizations: OrganizationResource[];
}

interface IOwnProps {
  groups: GroupResource[];
  currentUser: UserResource;
}

type IProps = INeededProps & i18nProps & IOwnProps;

function MultiGroupSelect({ organizations, user, groups }: IProps) {
  const groupList = (
    <GroupListByOrganization groups={groups} user={user} organizations={organizations} />
  );
  return (
    <div className='p-l-xxs' data-test-group-no-edit>
      {groupList}
    </div>
  );
}

export default compose<IProps, INeededProps>(
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
)(MultiGroupSelect);
