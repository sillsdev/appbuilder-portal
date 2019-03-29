import * as React from 'react';
import { compose } from 'recompose';
import md5 from 'md5-hash';
import { withTranslations, i18nProps } from '@lib/i18n';
import { UserAttributes } from '@data/models/user';

import { attributesFor, USERS_TYPE } from '@data';

import './show.scss';
import { ResourceObject } from 'jsonapi-typescript';

import { withData } from '../edit/with-data';

export const pathName = '/users/:id';

export interface IOwnProps {
  user: ResourceObject<USERS_TYPE, UserAttributes>;
}

export type IProps = IOwnProps & i18nProps;

class User extends React.Component<IProps> {
  render() {
    const { t, user: userData } = this.props;
    const user = attributesFor(userData);

    const fullname = user.name;
    const phone = user.phone ? user.phone : t('profile.noPhone');
    const timezone = user.timezone ? `(${user.timezone})` : t('profile.noTimezone');

    const gravatarHash = md5((user.email || '').trim().toLowerCase());

    return (
      <div data-test-show-profile className='ui container show-profile'>
        <h2 className='m-t-lg m-b-lg'>{t('profile.generalInformation')}</h2>
        <div className='flex-row'>
          <div>
            <img
              data-test-show-profile-image
              src={`https://www.gravatar.com/avatar/${gravatarHash}?s=130&d=identicon`}
            />
          </div>
          <div>
            <h4 data-test-show-profile-name>{fullname}</h4>
            {(user && user.profileVisibility && (
              <>
                <p data-test-show-profile-email>{user.email}</p>
                <p data-test-show-profile-phone>{phone}</p>
                <p data-test-show-profile-timezone>{timezone}</p>
              </>
            )) ||
              null}
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
