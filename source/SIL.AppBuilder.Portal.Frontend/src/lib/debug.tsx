import * as React from 'react';

export function withDebugger(InnerComponent) {
  return props => {
    /* tslint:disable */
    debugger;
    /* tslint:enable */

    return <InnerComponent { ...props } />;
  };
}

export function assert(condition, message, throwError = true) {
  if (!condition) {
    console.error(message);

    if (throwError) {
      throw message;
    }
  }
}
