import * as React from 'react';
import { RouterProps, Redirect } from 'react-router';
import { withCurrentUser, useCurrentUser } from '@data/containers/with-current-user';
import { isLoggedIn, hasVerifiedEmail } from '@lib/auth0';

import { storePath } from './return-to';

export function requireAuth(opts = {}) {
  return (Component) => {
    function checkForAuth(propsWithRouting: RouterProps) {
      const authenticated = isLoggedIn();

      if (authenticated) {
        if (!hasVerifiedEmail()) {
          return <Redirect push={false} to={'/verify-email'} />;
        }
        const WithUser = withCurrentUser(opts)(Component);

        return <WithUser {...propsWithRouting} />;
      }

      const attemptedLocation = propsWithRouting.history.location.pathname;

      storePath(attemptedLocation);

      console.debug('redirecting to login because the user was not authenticated');
      return <Redirect push={true} to={'/login'} />;
    }

    return checkForAuth;
  };
}
