import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouterProps } from 'react-router';
import { Link } from 'react-router-dom';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { requireNoAuth, retrievePath } from '@lib/auth';
import { pathName as requestOrgAccessPath } from '@ui/routes/request-access-for-organization';
import AutoMountingLock from './auth0-lock-auto-mount';

export const pathName = '/login';

class LoginRoute extends React.Component<RouterProps & i18nProps> {
  state = { data: {}, errors: {} };
  render() {
    const { history, t } = this.props;

    return (
      <div className='bg-blue flex-grow flex-column justify-content-center align-items-center'>

        <AutoMountingLock afterLogin={() => history.push(retrievePath(true) || '/tasks')}/>

        <div className='white-text m-b-md m-t-md'>
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
        </div>
      </div>
    );
  }
}

export default compose(
  withRouter,
  requireNoAuth('/'),
  translate('translations')
)(LoginRoute);
