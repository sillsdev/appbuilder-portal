import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withData } from '../edit/with-data';
import { UserAttributes } from '@data/models/user';
import { getPictureUrl } from '@lib/auth0';
import { attributesFor } from '@data';

import './show.scss';

export const pathName = '/users/:id';

export interface IOwnProps {
  user: JSONAPI<UserAttributes>;
}

export type IProps =
  & IOwnProps
  & i18nProps;

class User extends React.Component<IProps> {

  render() {

    const { t, user: userData } = this.props;
    const user = userData.attributes;

    return (
      <div className='ui container show-profile'>
        <h2 className='m-t-lg m-b-lg'>{t('profile.generalInformation')}</h2>
        <div className='flex-row'>
          <div>
            <img className='round' src={getPictureUrl()} />
          </div>
          <div>
            <h4>{`${user.givenName} ${user.familyName}`}</h4>
            <p>{user.email}</p>
            {
              user && user.profileVisibility &&
              <>
                <p>{user.phone ? user.phone : t('profile.noPhone') }</p>
                <p>{user.timezone ? `(${user.timezone})` : t('profile.noTimezone')}</p>
              </>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withData,
  withTranslations
)(User);