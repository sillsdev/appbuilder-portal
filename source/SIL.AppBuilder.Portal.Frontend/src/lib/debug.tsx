import * as React from 'react';

export function withDebugger(InnerComponent) {
  return (props) => {
    debugger; // eslint-disable-line no-debugger

    return <InnerComponent {...props} />;
  };
}

export function inspectProps(fn = console.log.bind(null, 'inspecting: ')) {
  return (InnerComponent) => (props) => {
    fn(props);
    return <InnerComponent {...props} />;
  };
}

export const logProps = (label: string) => (WrappedComponent) => {
  return (props) => {
    console.log('DEBUG: ', label, props);

    return <WrappedComponent {...props} />;
  };
};

export function measureTime(label: string, fn: (...args: any[]) => void) {
  return (...args: any[]) => {
    console.time(label);
    let returnValue = fn(...args);
    console.timeEnd(label);

    return returnValue;
  };
}

export function requireProps(...propsToCheck) {
  return (InnerComponent) => (props) => {
    const missingProps: string[] = [];

    propsToCheck.forEach((prop) => {
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

    return <InnerComponent {...props} />;
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
