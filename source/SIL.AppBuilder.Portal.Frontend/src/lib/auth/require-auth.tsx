import * as React from 'react';
import { RouterProps, Redirect } from 'react-router';

import { withCurrentUser } from '@data/containers/with-current-user';
import { isLoggedIn } from '@lib/auth0';

import { requireAuthHelper } from './require-auth-helper';
import { storePath } from './return-to';

export function requireAuth(Component) {
  // this.displayName = 'RequireAuth';

  const checkForAuth = (propsWithRouting: RouterProps) => {
    const authenticated = isLoggedIn();

    if (authenticated) {
      const WithUser = withCurrentUser()(Component);

      return <WithUser { ...propsWithRouting } />;
    }

    const attemptedLocation = propsWithRouting.history.location.pathname;

    storePath(attemptedLocation);

    // toast.error('You must be logged in to do that');

    return <Redirect to={'/login'} />;
  };

  return requireAuthHelper(checkForAuth);
}

requireAuth.displayName = 'RequireAuth';
