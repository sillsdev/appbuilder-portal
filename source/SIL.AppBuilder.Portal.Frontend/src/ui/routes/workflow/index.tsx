import * as React from 'react';
import { withRouter } from 'react-router';

import { PageLoader as Loader } from '@ui/components/loaders';
import { ErrorBoundary } from '@ui/components/errors';

export const pathName = '/workflow';

class Deps extends React.Component {
  async componentDidMount() {
    const $ = await import(/* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.js');
    const jQuery = $.default;
    jQuery.prototype = $.prototype;
    global.jQuery = window.jQuery = global.$ = window.$ = jQuery;
    import(/* webpackChunkName: "workflow/konva" */ '@assets/vendor/dwkit/konva.min.js');
    import(/* webpackChunkName: "workflow/ace" */ '@assets/vendor/dwkit/ace.js');
    import(/* webpackChunkName: "workflow/Chart" */ '@assets/vendor/dwkit/Chart.min.js');
    import(/* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.auto-complete.min.js');
    import(/* webpackChunkName: "workflow/jQuery" */ '@assets/vendor/dwkit/jquery.loadingModal.min.js');
  }

  render() {
    return null;
  }
}

export default withRouter(props => {
  const { location: { pathname } } = props;
  const dwKitPaths = ['/form', '/flow'];
  const isMatch = dwKitPaths
    .filter(pathRoot => new RegExp(`^${pathRoot}`).test(pathname))
    .length > 0;

  if (isMatch) {
    const LazyWorkflowApp = React.lazy(() => import(/* webpackChunkName: "workflow/app" */ './app'));

    return (
      <React.Suspense fallback={<Loader />}>
        <ErrorBoundary>
          <>
            <Deps />
            <LazyWorkflowApp />
          </>
        </ErrorBoundary>
      </React.Suspense>
    );
  }

  return null;
});
