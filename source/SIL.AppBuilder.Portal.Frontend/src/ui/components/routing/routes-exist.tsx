import React from 'react';
import { Redirect } from 'react-router-dom';

import { RouteBoundary } from './boundaries';

import { useRouter } from '~/lib/hooks';

/**
 * due to how we want to re-use UI during route changes,
 * routes that _exist_ but may not be authorized to view
 * will fallback to the NotFound Error Route.
 *
 * If we are ok with that behavior, than we can remove this hackery.
 * This component exists only to tell the two sets of routes:
 *  - Authorized
 *  - Unauthorized
 * ... that the other set of routes exists, and to not render a 404,
 * but to redirect back to '/', and start the routing process over again.
 * (this only really matters for refreshes, and direct links from external
 * sources)
 */
export function RoutesExist({ paths }) {
  const { history } = useRouter();
  if ((paths || []).length === 0) {
    return null;
  }

  return (
    <RouteBoundary paths={paths}>
      {/* {console.log(history.location.pathname)} */}
      <Redirect to={'/'} push={true} />
    </RouteBoundary>
  );
}
