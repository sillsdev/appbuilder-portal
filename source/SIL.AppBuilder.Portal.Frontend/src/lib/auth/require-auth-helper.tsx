import * as React from 'react';
import { withRouter, RouterProps } from 'react-router';

export function requireAuthHelper(authenticationChecker: (props: RouterProps) => any) {
  return (props: any) => {
    if (props.history) {
      return authenticationChecker(props);
    }

    const WrappedWithRouter = withRouter(authenticationChecker);

    return <WrappedWithRouter {...props} />;
  };
}
