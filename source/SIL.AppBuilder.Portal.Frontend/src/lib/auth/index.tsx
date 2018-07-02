import * as React from 'react';
import { withRouter, RouterProps, Redirect } from 'react-router';

import { isLoggedIn } from '@lib/auth0';
import * as toast from '@lib/toast';

import { pathName as loginPath } from '@ui/routes/login';

export function requireAuth(Component) {
  const checkForAuth = (propsWithRouting: RouterProps) => {
    const authenticated = isLoggedIn();

    if (authenticated) {
      return <Component { ...propsWithRouting } />;
    }

    // toast.error('You must be logged in to do that');

    return <Redirect to={loginPath} />;
  };

  return requireAuthHelper(checkForAuth);
}

export function requireNoAuth(redirectPath = '/') {
  return (Component) => {
    const checkForNoAuth = (propsWithRouting: RouterProps) => {
      const authenticated = isLoggedIn();

      if (!authenticated) {
        return <Component { ...propsWithRouting } />;
      }

      // toast.error('You must be logged out to do that');

      return <Redirect to={redirectPath} />;
    };

    return requireAuthHelper(checkForNoAuth);
  };
}

function requireAuthHelper(authenticationChecker: (props: RouterProps) => any) {
  return (props: any) => {
    if (props.history) {
      return authenticationChecker(props);
    }

    const WrappedWithRouter = withRouter(authenticationChecker);

    return <WrappedWithRouter {...props } />;
  };
}
