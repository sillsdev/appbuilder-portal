import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { withData as withOrbit, DataProviderProps as IOrbitProps } from 'react-orbitjs';

import { deleteToken } from '@lib/auth0';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { APP_RESET } from '~/redux-store/reducers';

export interface IProvidedProps {
  logout: (e: any) => void;
}

interface IComposedProps {
  resetRedux: () => void;
}

export type IProps =
& IOrbitProps
& RouteComponentProps<{}>
& IComposedProps;

export function withLogout<TWrappedProps>(WrappedComponent) {
  class LogoutProvider extends React.Component<IProps & TWrappedProps> {
    logout = (e) => {
        if (e && e.preventDefault) { e.preventDefault(); }

        const { history, resetRedux, dataStore } = this.props;

        resetRedux();
        deleteToken();
        localStorage.clear();
        dataStore.cache.reset();
        history.push('/login');
    }

    render() {
      return <WrappedComponent { ...this.props } logout={this.logout} />;
    }
  }

  return compose<IProps, TWrappedProps>(
    withRouter,
    connect(null, (dispatch) => {
      return {
        resetRedux: () => dispatch({ type: APP_RESET }),
      };
    }),
    withOrbit({}),
  )(LogoutProvider);
}
