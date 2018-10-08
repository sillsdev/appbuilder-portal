import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import { withLayout } from '@ui/components/layout';

export function withAuthLayout(Component) {
  console.warn(`
    [DEPRECATED]: use withLayout from @ui/components/layout instead of withAuthLayout
  `);

  return withLayout(Component);
}

class ScrollToTopOnLocationChange extends React.Component<any, any> {
  componentDidUpdate(prevProps: RouteComponentProps) {
    const props = this.props as RouteComponentProps;
    const didLocationChange = props.location !== prevProps.location;

    if (didLocationChange) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return this.props.children;
  }
}

export const ScrollToTop = withRouter(ScrollToTopOnLocationChange);

export function withResetScroll(WrappedComponent) {
  return props => (
    <ScrollToTop>
      <WrappedComponent { ...props } />
    </ScrollToTop>
  );
}
