import * as React from 'react';

export interface IPaginateProps {
  pageOptions: any;
}

export function withPagination(WrappedComponent) {
  return props => <WrappedComponent { ...props } />;
}
