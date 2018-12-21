import * as React from 'react';

import { ICurrentUserProps } from './types';
import { withFetcher } from './fetcher';
import { withDisplay } from './display';

export { ICurrentUserProps } from './types';

const CurrentUserContext = React.createContext<ICurrentUserProps>({
  currentUser: undefined,
  currentUserProps: {}
});

export const Provider = withFetcher()(
  (props: ICurrentUserProps & { children: any }) => {
    const { currentUser, currentUserProps, children } = props;

    return (
      <CurrentUserContext.Provider value={{ currentUser, currentUserProps }}>
        {children}
      </CurrentUserContext.Provider>
    );
});


export function withCurrentUserContext(InnerComponent) {
  return props => {
    return (
      <CurrentUserContext.Consumer>
        {(context) => <InnerComponent {...props} { ...context}/> }
      </CurrentUserContext.Consumer>
    );
  };
}

export function withCurrentUser(opts = {}) {
  return InnerComponent => props => {
    const Inner = (context) => {
      const {
        currentUser,
        currentUserProps: { fetchCurrentUser }
      } = context;

      const WithCurrentUser = withDisplay(opts)(() => (
        <InnerComponent
          {...props}
          { ...{ currentUser, fetchCurrentUser } }
        />
      ));

      return <WithCurrentUser { ...context } />;
    };

    return (
      <CurrentUserContext.Consumer>
        {(context) => <Inner { ...context } />}
      </CurrentUserContext.Consumer>
    );
  };
}
