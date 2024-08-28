import * as React from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@data/containers/with-current-user';
import { retrievePath } from '@lib/auth';
import { useTranslations } from '@lib/i18n';
import { hasVerifiedEmail } from '@lib/auth0';
import * as paths from '@ui/routes/paths';

import AutoMountingLock from './auth0-lock-auto-mount';

import { useRouter } from '~/lib/hooks';
import { useAuth } from '~/data/containers/with-auth';

export default function LoginRoute() {
  const { t } = useTranslations();
  const { history } = useRouter();
  const { refreshAuth, isLoggedIn } = useAuth();
  const {
    currentUserProps: { fetchCurrentUser },
  } = useCurrentUser();

  if (isLoggedIn) {
    console.log('logged in, redirecting...');
    return <Redirect push={true} to={'/tasks'} />;
  }

  const afterLogin = async () => {
    refreshAuth();

    if (!hasVerifiedEmail()) {
      history.push('/verify-email');
    } else {
      await fetchCurrentUser();
      history.push(retrievePath(true) || '/tasks');
    }
  };

  return (
    <div data-test-login-page className='bg-blue flex-grow flex-column justify-content-center'>
      <AutoMountingLock afterLogin={afterLogin} />

      <div className='white-text m-b-md m-t-md text-center'>
        {t('invitations.orgPrompt')}
        &nbsp;
        <Link to={paths.requestOrgAccessPath} className='white-text bold'>
          {t('contactUs')}
        </Link>
      </div>

      <div className='w-100 m-r-md m-t-md auth0-badge'>
        <a
          className='no-margins'
          href='https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss'
          target='_blank'
          rel='noopener noreferrer'
          title='Single Sign On & Token Based Authentication - Auth0'
        >
          <img
            width='150'
            height='50'
            alt='JWT Auth for open source projects'
            src='//cdn.auth0.com/oss/badges/a0-badge-light.png'
          />
        </a>
        <br />
        <Link to={'/open-source'} target='_blank' rel='noopener noreferrer' className='white-text'>
          {t('opensource')}
        </Link>
      </div>
    </div>
  );
}
