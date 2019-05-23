import React, { useState, useEffect } from 'react';
import { PageLoader as Loader } from '@ui/components/loaders';
import { ErrorBoundary } from '@ui/components/errors';
import { RouteBoundary } from '@ui/components/routing/boundaries';

import { useRouter } from '~/lib/hooks';

export const pathName = '/workflow';

async function appendScriptToHead(path: string) {
  const response = await fetch(path);
  const text = await response.text();

  const head = document.querySelector('head');
  const script = document.createElement('script');

  script.setAttribute('type', 'text/javascript');
  script.innerHTML = text;

  head.appendChild(script);
}

async function depFetcher() {
  const $ = await import(
    /* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.js'
  );
  const jQuery = $.default;
  jQuery.prototype = $.prototype;
  global.jQuery = window.jQuery = global.$ = window.$ = jQuery;

  await Promise.all([
    import(/* webpackChunkName: "workflow/konva" */ '@assets/vendor/dwkit/konva.min.js'),
    import(/* webpackChunkName: "workflow/ace" */ '@assets/vendor/dwkit/ace.js'),
    import(/* webpackChunkName: "workflow/Chart" */ '@assets/vendor/dwkit/Chart.min.js'),
    import(
      /* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.auto-complete.min.js'
    ),
    import(
      /* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.loadingModal.min.js'
    ),
  ]);

  // runtime dependencies...
  await appendScriptToHead('/ui/form/businessobjects.js');
}

function DepsLoader({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    (async () => {
      await depFetcher();

      setIsLoading(false);
    })();
  }, [isLoading]);

  if (isLoading) {
    return <Loader />;
  }

  return children;
}

function WorkflowLoader() {
  const LazyWorkflowApp = React.lazy(() => import(/* webpackChunkName: "workflow/app" */ './app'));

  return (
    <ErrorBoundary>
      <DepsLoader>
        <React.Suspense fallback={<Loader />}>
          <LazyWorkflowApp />
        </React.Suspense>
      </DepsLoader>
    </ErrorBoundary>
  );
}

export default function WorkflowWrapper() {
  return (
    <RouteBoundary paths={['/form', '/flow']}>
      <WorkflowLoader />
    </RouteBoundary>
  );
}
