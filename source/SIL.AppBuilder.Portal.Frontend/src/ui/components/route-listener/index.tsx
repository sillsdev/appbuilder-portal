import React, { useEffect } from 'react';
import { useCurrentUser } from '@data/containers/with-current-user';

import { useRouter } from '~/lib/hooks';

import { isTesting } from '~/env';

export function RouteListener() {
  const { history } = useRouter();
  const {
    currentUserProps: { fetchCurrentUser },
  } = useCurrentUser();

  useEffect(() => {
    if (!isTesting) {
      return;
    }

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
  });

  return null;
}
