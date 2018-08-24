import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import * as toast from '@lib/toast';
import { hasRelationship, relationshipFor } from '@data';

// The current user must:
// - have at least organization membership that matches the
//   the organization that the project is assigned to
export function withAccessRestriction(WrappedComponent) {
  const mapRecordsToProps = (passedProps) => {
    const { currentUser, project } = passedProps;

    return {
      userOrgMemberships: q => q.findRelatedRecords(
        { type: currentUser.type, id: currentUser.id }, 'organizationMemberships'),
      projectOrg: q => q.findRelatedRecord(
        { type: project.type, id: project.id }, 'organization')
    };
  };


  const DataWrapper = props => {
    const { t, userOrgMemberships, projectOrg } = props;

    const userOrgIds = userOrgMemberships.filter(om => {
      const org = relationshipFor(om, 'organization').data || {};

      return org.id === projectOrg.id;
    });

    const isAMember = userOrgIds.length > 0;

    if (isAMember) {
      return <WrappedComponent { ...props } />;
    }

    toast.error(t('errors.notAMemberOfOrg'));

    return <Redirect to={'/'} />;
  };

  return compose(
    withOrbit(mapRecordsToProps)
  )(DataWrapper);
}
