import React, { memo, Suspense } from 'react';
import { useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { hasRelationship } from '@data';

import * as toast from '@lib/toast';
import { isLoggedIn as isValidToken, isTokenExpired, hasVerifiedEmail, getToken } from '@lib/auth0';
import PageLoader from '@ui/components/loaders/page';
import PageError from '@ui/components/errors/page';

import { ICurrentUserProps } from './types';
import { useFetcher } from './fetcher';

export { ICurrentUserProps } from './types';

export const CurrentUserContext = React.createContext<ICurrentUserProps>({
  currentUser: undefined,
  isLoggedIn: false,
  currentUserProps: {},
});

export function useCurrentUser() {
  return useContext<ICurrentUserProps>(CurrentUserContext);
}

export function Provider({ children }) {
  const { currentUser, isLoading, error, fetchCurrentUser } = useFetcher();

  const isLoggedIn = !!(isValidToken() && currentUser);

  return (
    <CurrentUserContext.Provider
        value={{
          currentUser,
          isLoggedIn,
          currentUserProps: { 
            isLoading, error, 
            fetchCurrentUser, 
            currentUser,
            isLoggedIn,
            isTokenExpired: isTokenExpired(),
            hasVerifiedEmail: hasVerifiedEmail(),
            token: getToken(),
           },
        }}
      >
        {children}
      </CurrentUserContext.Provider>
  );
}


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
    const userData = useCurrentUser();
    console.log('userData', userData);
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
    }

    if (currentUser) {
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
