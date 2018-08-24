import * as React from 'react';
import { compose } from 'recompose';
import md5 from 'md5-hash';

import { withTranslations, i18nProps } from '@lib/i18n';
import { withData } from '../edit/with-data';
import { UserAttributes } from '@data/models/user';
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

    const fullname = `${user.givenName} ${user.familyName}`;
    const phone = user.phone ? user.phone : t('profile.noPhone');
    const timezone = user.timezone ? `(${user.timezone})` : t('profile.noTimezone');

    const gravatarHash = md5((user.email || '').trim().toLowerCase());

    return (
      <div className='ui container show-profile'>
        <h2 className='m-t-lg m-b-lg'>{t('profile.generalInformation')}</h2>
        <div className='flex-row'>
          <div>
            <img src={`https://www.gravatar.com/avatar/${gravatarHash}?s=130&d=identicon`} />
          </div>
          <div>
            <h4>{fullname}</h4>
            <p>{user.email}</p>
            {
              user && user.profileVisibility &&
              <>
                <p>{phone}</p>
                <p>{timezone}</p>
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