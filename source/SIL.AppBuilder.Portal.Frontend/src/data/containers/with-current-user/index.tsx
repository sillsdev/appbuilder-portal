import React, { Suspense } from 'react';
import { useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { hasRelationship } from '@data';

import * as toast from '@lib/toast';
import PageLoader from '@ui/components/loaders/page';
import PageError from '@ui/components/errors/page';

import { ICurrentUserProps } from './types';
import { withFetcher, CurrentUserFetcher } from './fetcher';

import { CurrentUserFetchError } from '~/data/errors/current-user-fetch-error';

export { ICurrentUserProps } from './types';

export const CurrentUserContext = React.createContext<ICurrentUserProps>({
  currentUser: undefined,
  currentUserProps: {},
});

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}

export function Provider({ children }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <CurrentUserFetcher>
        {({ currentUser, refetch }) => {
          return (
            <CurrentUserContext.Provider
              value={{
                currentUser,
                currentUserProps: {
                  currentUser,
                  fetchCurrentUser: refetch,
                },
              }}
            >
              {children}
            </CurrentUserContext.Provider>
          );
        }}
      </CurrentUserFetcher>
    </Suspense>
  );
}

// export const Provider = withFetcher()((props: ICurrentUserProps & { children: any }) => {
//   const { currentUser, currentUserProps, children } = props;

//   return (
//     <CurrentUserContext.Provider value={{ currentUser, currentUserProps }}>
//       {children}
//     </CurrentUserContext.Provider>
//   );
// });

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

export function LoadCurrentUser({ children }) {
  const CurrentUserValidation = withDisplay();

  return <CurrentUserValidation>{children}</CurrentUserValidation>;
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

        console.log('there was an error getting the current user...', error, isLoading);
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

    // TODO: would it ever make sense to do an inline login instead of a redirect?
    console.log('current user does not exist.... how?');
    return <Redirect push={true} to={'/login'} />;
  };
}
