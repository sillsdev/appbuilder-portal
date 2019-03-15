import React from 'react';
import { Redirect } from 'react-router-dom';

import { useRouter } from '~/lib/hooks';

import { storePath } from '~/lib/auth';

import { useAuth } from '~/data/containers/with-auth';

export function VerifyAccess() {
  const { history } = useRouter();
  const { isLoggedIn, hasVerifiedEmail } = useAuth();

  const attemptedPath = history.location.pathname;

  if (!isLoggedIn) {
    storePath(attemptedPath);

    return <Redirect push={true} to={'/login'} />;
  }

  if (!hasVerifiedEmail) {
    return <Redirect push={false} to={'/verify-email'} />;
  }

  return null;
}
