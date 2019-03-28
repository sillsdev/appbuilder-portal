import React from 'react';
import { Redirect } from 'react-router-dom';

import { useRouter } from '~/lib/hooks';

import { storePath } from '~/lib/auth';

import { useAuth } from '~/data/containers/with-auth';

export function VerifyAccess() {
  const { location } = useRouter();
  const { isLoggedIn, hasVerifiedEmail } = useAuth();

  const attemptedPath = location.pathname;

  if (!isLoggedIn) {
    storePath(attemptedPath);

    console.log('not logged in, redirecting...');
    return <Redirect push={true} to={'/login'} />;
  }

  if (!hasVerifiedEmail) {
    return <Redirect push={false} to={'/verify-email'} />;
  }

  return null;
}
