import * as React from 'react';

import { compose } from 'recompose';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Container } from 'semantic-ui-react';
import { WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';

import { withTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';

import { USERS_TYPE, update } from '@data';
import { UserAttributes } from '@data/models/user';
import { withCurrentUser } from '@data/containers/with-current-user';

import EditProfileForm from './form';
import { withData } from './with-data';

import './profile.scss';

export const pathName = '/users/:id/edit';

export interface IOwnProps {
  user: ResourceObject<USERS_TYPE, UserAttributes>;
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
}

export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps;

class Profile extends React.Component<IProps> {

  updateProfile = async (attributes: UserAttributes): Promise<void> => {
    const { t, user, dataStore } = this.props;

    try {
      await update(dataStore, user, { attributes });

      toast.success(t('profile.updated'));

    } catch (e) {
      toast.error(e);
    }
  }

  render() {
    const { t, user } = this.props;

    return (
      <Container className='profile'>
        <h1 className='title'>{t('profile.title')}: { user && user.attributes.givenName }</h1>
        <div>
          <h2>{t('profile.general')}</h2>

          <EditProfileForm user={user} onSubmit={this.updateProfile} />
        </div>
      </Container>
    );
  }
}

// TODO: if no permission to edit, redirect to view
export default compose(
  withTranslations,
  withCurrentUser(),
  withData,
)(Profile);
