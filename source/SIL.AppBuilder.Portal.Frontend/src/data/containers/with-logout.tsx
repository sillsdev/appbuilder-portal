import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import { deleteToken } from '@lib/auth0';

export function withLogout<TWrappedProps>(WrappedComponent) {
  class LogoutProvider extends React.Component<RouteComponentProps<{}> & TWrappedProps> {
    logout = (e) => {
        if (e && e.preventDefault) { e.preventDefault(); }

        const { history } = this.props;

        deleteToken();
        history.push('/login');
    }

    render() {
      return <WrappedComponent { ...this.props } logout={this.logout} />;
    }
}

return withRouter(LogoutProvider);
}
