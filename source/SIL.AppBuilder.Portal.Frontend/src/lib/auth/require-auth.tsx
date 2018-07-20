import * as React from 'react';
import { RouterProps, Redirect } from 'react-router';

import { withCurrentUser } from '@data/with-current-user';
import { isLoggedIn } from '@lib/auth0';

import { requireAuthHelper } from './require-auth-helper';

export function requireAuth(Component) {
  const checkForAuth = (propsWithRouting: RouterProps) => {
    const authenticated = isLoggedIn();

    if (authenticated) {
      const WithUser = withCurrentUser()(Component);

      return <WithUser { ...propsWithRouting } />;
    }

    // toast.error('You must be logged in to do that');

    return <Redirect to={'/login'} />;
  };

  return requireAuthHelper(checkForAuth);
}

