import * as React from 'react';
import { useState, useEffect } from 'react';
import { Redirect, match } from 'react-router';
import { ICurrentUserProps, useCurrentUser } from '@data/containers/with-current-user';
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

export default function JoinOrganizationFinishedRoute({ match }: IProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDoneFetching, setIsDoneFetching] = useState(false);
  const {
    currentUser,
    currentUserProps: { fetchCurrentUser },
  } = useCurrentUser();

  async function getCurrentUser() {
    await fetchCurrentUser({ forceReloadFromServer: true });
    setIsDoneFetching(true);
  }
  useEffect(() => {
    if (
      isRelatedTo(currentUser, 'organizationMemberships', match.params.organizationMembershipId)
    ) {
      setIsLoading(false);
    } else {
      getCurrentUser();
    }
  }, [currentUser, isDoneFetching]);

  if (isLoading) {
    return <PageLoader />;
  } else {
    return <Redirect push={false} to='/' />;
  }
}
