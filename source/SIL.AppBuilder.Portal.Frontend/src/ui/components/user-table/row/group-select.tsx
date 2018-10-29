import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import {
  withCurrentUser,
  IProvidedProps as ICurrentUserProps
} from '@data/containers/with-current-user';
import { withLoader, relationshipFor } from '@data';

class GroupSelect extends React.Component {

  render() {

    const { userOrgs, currentUserOrgs } = this.props;

    debugger;

    return (
      <div/>
    );
  }

}

export default compose(
  withCurrentUser(),
  withOrbit(({currentUser, user}) => {
    return {
      cuOrganizationMemberships: q => q.findRelatedRecords(currentUser,'organizationMemberships'),
      organizationMemberships: q => q.findRelatedRecords(user,'organizationMemberships')
    }
  }),
  withLoader(({ currentUserOrganizationMemberships, organizationMemberships }) =>
    !currentUserOrganizationMemberships || !organizationMemberships),
  withProps(props => {
    const { cuOrganizationMemberships, organizationMemberships } = props;

    const userOrgs = relationshipFor(organizationMemberships,'organization');
    const currentUserOrgs = relationshipFor(cuOrganizationMemberships,'organization');
    return {
      userOrgs: userOrgs,
      currentUserOrgs: currentUserOrgs
    }
  }),
)(GroupSelect);