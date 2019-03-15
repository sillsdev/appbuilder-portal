import * as React from 'react';
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

class Deps extends React.Component {
  async componentDidMount() {
    const $ = await import(/* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.js');
    const jQuery = $.default;
    jQuery.prototype = $.prototype;
    global.jQuery = window.jQuery = global.$ = window.$ = jQuery;

    await Promise.all([
      import(/* webpackChunkName: "workflow/konva" */ '@assets/vendor/dwkit/konva.min.js'),
      import(/* webpackChunkName: "workflow/ace" */ '@assets/vendor/dwkit/ace.js'),
      import(/* webpackChunkName: "workflow/Chart" */ '@assets/vendor/dwkit/Chart.min.js'),
      import(/* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.auto-complete.min.js'),
      import(/* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.loadingModal.min.js'),
    ]);

    // runtime dependencies...
    await appendScriptToHead('/ui/form/businessobjects.js');
  }

  render() {
    return this.props.children;
  }
}

function WorkflowLoader() {
  const LazyWorkflowApp = React.lazy(() => import(/* webpackChunkName: "workflow/app" */ './app'));

  return (
    <React.Suspense fallback={<Loader />}>
      <ErrorBoundary>
        <>
          <Deps>
            <LazyWorkflowApp />
          </Deps>
        </>
      </ErrorBoundary>
    </React.Suspense>
  );
}

export default function WorkflowWrapper() {
  return (
    <RouteBoundary paths={['/form', '/flow']}>
      <WorkflowLoader />
    </RouteBoundary>
  );
}
