import * as React from 'react';
import { Redirect, match } from 'react-router';
import { compose } from 'recompose';
import { requireAuth } from '@lib/auth';
import { pathName as tasksPath } from '@ui/routes/tasks';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';
import { PageLoader } from '@ui/components/loaders';

import { isRelatedTo } from '@data';

export const pathName =
  '/invitations/organization-membership/:token/finished/:organizationMembershipId';

interface Params {
  organizationMembershipId: string;
}

interface IOwnProps {
  match: match<Params>;
}

type IProps = IOwnProps & ICurrentUserProps;

interface IState {
  isLoading: boolean;
}

class JoinOrganizationFinishedRoute extends React.Component<IProps, IState> {
  state = {
    isLoading: true,
  };

  updateUserFromCache = async () => {
    const {
      currentUserProps: { fetchCurrentUser },
    } = this.props;
    await fetchCurrentUser();
  };

  componentDidMount() {
    const { currentUser } = this.props;

    if (
      isRelatedTo(
        currentUser,
        'organizationMemberships',
        this.props.match.params.organizationMembershipId
      )
    ) {
      this.setState({ isLoading: false });
    } else {
      this.updateUserFromCache();
    }
  }

  render() {
    const { isLoading } = this.state;

    if (isLoading) {
      return <PageLoader />;
    } else {
      return <Redirect push={true} to={tasksPath} />;
    }
  }
}

export default compose(
  withCurrentUserContext,
  requireAuth({ redirectOnMissingMemberships: false })
)(JoinOrganizationFinishedRoute);
