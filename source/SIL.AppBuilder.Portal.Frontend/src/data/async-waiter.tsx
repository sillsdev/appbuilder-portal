import React, { memo, useCallback } from 'react';
import { useAsync } from 'react-use';
import { PageLoader } from '~/ui/components/loaders';

export function AsyncWaiter<Fn extends Function>({
  children,
  fn,
  loadingProps = {},
}: {
  children?: any;
  fn: Fn;
  loadingProps?: any
}) {
  if (!fn) {
    throw new Error(`Function passed to AsyncWaiter must not be falsey`);
  }

  const state = useAsync(fn as any);
  const { error, loading, value } = state;

  if (error) {
    throw error;
  }

  if (loading) {
    return (
      <div {...loadingProps}>
        <PageLoader />
      </div>
    );
  }

  return children({ value });
}