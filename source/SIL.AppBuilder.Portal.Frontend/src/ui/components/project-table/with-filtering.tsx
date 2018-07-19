import * as React from 'react';

export function withFiltering(WrappedComponent) {
  return props => <WrappedComponent { ...props } />
}
