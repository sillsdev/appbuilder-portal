import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';

export const RouteListener = compose(
  withRouter,
  withCurrentUserContext,
)(class extends React.Component<RouteComponentProps & ICurrentUserProps> {
  componentDidMount() {
    const { history, currentUserProps: { fetchCurrentUser }} = this.props;

    // This is needed for testing.
    // In a bigtest, the application is mounted, THEN
    // the test begins -- I (preston) found no way to setup the right
    // conditions for the currentuser context provider to acquire the
    // current user data on initial mount / setupApplicationTest.
    //
    // Since current user is retrieved on mount of the app,
    // this is sort of a hack to trigger the fetching of the current user data.
    history.listen((location, action) => {
      // this method takes care of
      // knowing when it needs to not actually do anything
      fetchCurrentUser();

      // TODO: if in some debug mode, log transitions and such
      //      (handy for debugging tests)
      // console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`);
      // console.log(`The last navigation action was ${action}`);
    });
  }
  render() { return null; }
});
