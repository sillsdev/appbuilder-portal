import React, { useEffect } from 'react';
import { Route as ReactRouterRoute } from 'react-router-dom';

import { useRouter } from './hooks';

import ErrorBoundary from '~/ui/components/errors/error-boundary';

export function ScrollToTop({ children }) {
  const { location } = useRouter();

  useEffect(() => window.scrollTo(0, 0), [location]);

  return children;
}

export function withResetScroll(WrappedComponent) {
  return (props) => (
    <ScrollToTop>
      <WrappedComponent {...props} />
    </ScrollToTop>
  );
}

export function Route(passedProps: any /* RouteProps */) {
  const { onErrorProps, ...props } = passedProps;

  return (
    <ErrorBoundary>
      <ReactRouterRoute {...props} />
    </ErrorBoundary>
  );
}
