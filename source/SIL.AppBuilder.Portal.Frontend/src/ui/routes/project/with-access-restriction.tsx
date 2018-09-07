import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import * as toast from '@lib/toast';
import {
  hasRelationship,
  relationshipFor,
  isRelatedRecord,
  buildFindRelatedRecords,
  buildFindRelatedRecord
} from '@data';

// The current user must:
// - have at least organization membership that matches the
//   the organization that the project is assigned to
export function withAccessRestriction(WrappedComponent) {
  const mapRecordsToProps = (passedProps) => {
    const { currentUser, project } = passedProps;

    return {
      // TODO: remove orgMemberships when testing is complete
      orgMemberships: q => q.findRecords('organizationMembership'),
      userOrgMemberships: q => buildFindRelatedRecords(q, currentUser, 'organizationMemberships'),
      projectOrg: q => buildFindRelatedRecord(q, project, 'organization')
    };
  };


  const DataWrapper = props => {
    const { t, userOrgMemberships, projectOrg, orgMemberships } = props;

    const userOrgIds = userOrgMemberships.filter(om => {
      return isRelatedRecord(om, projectOrg);
    });

    const isAMember = userOrgIds.length > 0;

    if (isAMember) {
      return <WrappedComponent { ...props } />;
    }

    toast.error(t('errors.notAMemberOfOrg'));

    return <Redirect push={true} to={'/'} />;
  };

  return compose(
    withOrbit(mapRecordsToProps)
  )(DataWrapper);
}
