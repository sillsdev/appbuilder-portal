import * as React from 'react';
import { RouterProps, Redirect } from 'react-router';

import { isLoggedIn } from '@lib/auth0';

import { requireAuthHelper } from './require-auth-helper';

export function requireNoAuth(redirectPath = '/') {
  return (Component) => {
    const checkForNoAuth = (propsWithRouting: RouterProps) => {
      const authenticated = isLoggedIn();

      if (!authenticated) {
        return <Component { ...propsWithRouting } />;
      }

      // toast.error('You must be logged out to do that');

      return <Redirect push={true} to={redirectPath} />;
    };

    return requireAuthHelper(checkForNoAuth);
  };
}

