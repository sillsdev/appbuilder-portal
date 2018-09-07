import * as React from 'react';

export function withDebugger(InnerComponent) {
  return props => {
    /* tslint:disable */
    debugger;
    /* tslint:enable */

    return <InnerComponent { ...props } />;
  };
}

export function requireProps(...propsToCheck) {
  return InnerComponent => props => {
    let missingProps: string[] = [];

    propsToCheck.forEach(prop => {
      if (props[prop] === undefined) {
        missingProps.push(prop);
      }
    });

    const componentName = InnerComponent.displayName || 'unnamed';

    assert(
      missingProps.length === 0, 
      `This component (${componentName}) is missing the required props: ${missingProps.join()}`,
      true
    );

    return <InnerComponent { ...props } />
  }
}

export function assert(condition, message, throwError = true) {
  if (!condition) {
    console.error(message);

    if (throwError) {
      throw message;
    }
  }
}
