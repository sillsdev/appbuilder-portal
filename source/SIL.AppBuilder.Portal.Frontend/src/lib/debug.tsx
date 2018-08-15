import * as React from 'react';

export function withDebugger(InnerComponent) {

  return props => {
    debugger;

    return <InnerComponent { ...props } />;
  };
}
