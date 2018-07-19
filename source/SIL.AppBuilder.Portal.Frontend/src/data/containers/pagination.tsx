import * as React from 'react';

export function withPagination(WrappedComponent) {
  return props => <WrappedComponent { ...props } />;
}
