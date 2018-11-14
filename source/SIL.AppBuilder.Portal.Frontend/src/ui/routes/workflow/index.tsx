import * as React from 'react';

import { PageLoader as Loader } from '@ui/components/loaders';
import { ErrorBoundary } from '@ui/components/errors';

export const pathName = '/workflow';

export default () => {
  const LazyWorkflowApp = React.lazy(() => import('./app'));

  return (
    <React.Suspense fallback={<Loader />}>
      <ErrorBoundary>
        <LazyWorkflowApp />
      </ErrorBoundary>
    </React.Suspense>
  );
};