import * as React from 'react';

export function withDebugger(InnerComponent) {

  return props => {
    /* tslint:disable */
    debugger;
    /* tslint:enable */

    return <InnerComponent { ...props } />;
  };
}
