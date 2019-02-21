import React, { memo } from 'react';
import { useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { hasRelationship } from '@data';

import * as toast from '@lib/toast';
import PageLoader from '@ui/components/loaders/page';
import PageError from '@ui/components/errors/page';

import { ICurrentUserProps } from './types';
import { withFetcher, useFetcher } from './fetcher';

export { ICurrentUserProps } from './types';

export const CurrentUserContext = React.createContext<ICurrentUserProps>({
  currentUser: undefined,
  currentUserProps: {},
});

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}

export const Provider = memo(
  ({ children }) => {
    const { currentUser, isLoading, error, fetchCurrentUser } = useFetcher();

    if (isLoading) {
      return <PageLoader />;
    }

    return (
      <CurrentUserContext.Provider
        value={{
          currentUser,
          currentUserProps: { isLoading, error, fetchCurrentUser, currentUser },
        }}
      >
        {children}
      </CurrentUserContext.Provider>
    );
  },
  () => true
);

export function withCurrentUserContext(InnerComponent) {
  return (props) => {
    return (
      <CurrentUserContext.Consumer>
        {(context) => {
          return <InnerComponent {...props} {...context} />;
        }}
      </CurrentUserContext.Consumer>
    );
  };
}

// withCurrentUser, in general should not be used.
// withCurrentUserContext should be how consuming components
// get access to the currentUser.
// withCurrentUser includes some response-checking logic around
// the result of the current user request to handle things like
// - token expiration
// - 401
// - lack of organization membership
// - any other error
//
// this only needs to be used once in the entire component hierarchy.
// maybe in application.tsx
export function withCurrentUser(opts = {}) {
  return (InnerComponent) => (props) => {
    const CurrentUserValidation = withDisplay(opts);
    const {
      currentUser,
      currentUserProps: { fetchCurrentUser },
    } = useCurrentUser();

    return (
      <CurrentUserValidation>
        <InnerComponent {...props} {...{ currentUser, fetchCurrentUser }} />
      </CurrentUserValidation>
    );
  };
}

/**
 * Private Helpers
 */

const defaultOptions = {
  redirectOnFailure: true,
  redirectOnMissingMemberships: true,
};

function withDisplay(opts = {}) {
  const options = {
    ...defaultOptions,
    ...opts,
  };

  return function CurrentUserValidation({ children }) {
    const {
      currentUserProps: { error, currentUser, isLoading },
    } = useCurrentUser();

    if (error) {
      if (error.status && error.status >= 500) {
        return <PageError error={error} />;
      }

      if (options.redirectOnFailure) {
        toast.error(error);

        console.debug('redirect to login because an error occurred', error);
        return <Redirect push={true} to={'/login'} />;
      }

      return <PageError error={error} />;
    }

    if (isLoading) {
      return <PageLoader />;
    } else if (currentUser) {
      const hasMembership = hasRelationship(currentUser, 'organizationMemberships');

      if (hasMembership || !options.redirectOnMissingMemberships) {
        return children;
      }

      return <Redirect push={true} to={'/organization-membership-required'} />;
    }

    console.debug('Redirecting to login because the currentUser does not exist');
    // TODO: would it ever make sense to do an inline login instead of a redirect?
    return <Redirect push={true} to={'/login'} />;
  };
}
