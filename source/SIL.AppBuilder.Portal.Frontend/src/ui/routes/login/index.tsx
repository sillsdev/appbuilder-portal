import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouterProps } from 'react-router';
import { Link } from 'react-router-dom';

import { withCurrentUserContext } from '@data/containers/with-current-user';
import { requireNoAuth, retrievePath } from '@lib/auth';
import { withTranslations, i18nProps } from '@lib/i18n';
import { hasVerifiedEmail } from '@lib/auth0';
import { pathName as requestOrgAccessPath } from '@ui/routes/request-access-for-organization';
import AutoMountingLock from './auth0-lock-auto-mount';

export const pathName = '/login';

class LoginRoute extends React.Component<RouterProps & i18nProps> {
  state = { data: {}, errors: {} };

  afterLogin = async () => {
    const { history, currentUserProps: { fetchCurrentUser } } = this.props;
    if (!hasVerifiedEmail()) {
      history.push('/verify-email');
    }
    else{
      await fetchCurrentUser();
      history.push(retrievePath(true) || '/tasks');
    }
  }

  render() {
    const { t } = this.props;

    return (
      <div className='bg-blue flex-grow flex-column justify-content-center'>

        <AutoMountingLock afterLogin={this.afterLogin}/>

        <div className='white-text m-b-md m-t-md text-center'>
          {t('invitations.orgPrompt')}
          &nbsp;
          <Link to={requestOrgAccessPath} className='white-text bold'>
            {t('contactUs')}
          </Link>
        </div>

        <div className='w-100 m-r-md m-t-md auth0-badge'>
          <a
            className='no-margins'
            href="https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss"
            target="_blank"
            title="Single Sign On & Token Based Authentication - Auth0">
            <img
              width="150" height="50"
              alt="JWT Auth for open source projects" src="//cdn.auth0.com/oss/badges/a0-badge-light.png"/>
          </a>
          <br />
          <Link to={'/open-source'} target='_blank' className='white-text'>{t('opensource')}</Link>
        </div>
      </div>
    );
  }
}

export default compose(
  withRouter,
  requireNoAuth('/'),
  withTranslations,
  withCurrentUserContext,
)(LoginRoute);
