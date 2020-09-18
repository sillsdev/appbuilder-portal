import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { WithDataProps } from 'react-orbitjs';
import { withTranslations, i18nProps } from '@lib/i18n';

import { UserResource, update } from '@data';

import { ROLE } from '@data/models/role';
import { withRole } from '@data/containers/with-role';
import { UserAttributes } from '@data/models/user';
import { ICurrentUserProps, withCurrentUserContext } from '@data/containers/with-current-user';

import EditProfileForm from './form';
import { withData } from './with-data';

import './profile.scss';

export const pathName = '/users/:id/edit';

export interface IOwnProps {
  user: UserResource;
}

export type IProps = IOwnProps & WithDataProps & i18nProps & ICurrentUserProps;

class Profile extends React.Component<IProps> {
  updateProfile = async (attributes: UserAttributes): Promise<void> => {
    const { t, user, dataStore } = this.props;

    try {
      await update(dataStore, user, { attributes });
      toast.success(t('profile.updated'));
    } catch (e) {
      toast.error(e);
    }
  };

  render() {
    const { t, user } = this.props;
    const editProfileProps = {
      user,
      onSubmit: this.updateProfile,
    };

    return (
      <div className='ui container profile'>
        <h1 className='fs-36 bold gray-text page-heading-border p-t-lg p-b-md m-b-lg'>
          {t('profile.title')}: {user && user.attributes.name}
        </h1>
        <div>
          <h2 className='fs-21 bold gray-text m-b-lg'>{t('profile.general')}</h2>
          <EditProfileForm {...editProfileProps} />
        </div>
      </div>
    );
  }
}

// TODO: if no permission to edit, redirect to view
export default compose(
  withTranslations,
  withCurrentUserContext,
  withData,
  withRole(ROLE.OrganizationAdmin, {
    redirectTo: '/',
    overrideIf: (props: IProps) => {
      const { currentUser, user } = props;

      return currentUser.id === user.id;
    },
  })
)(Profile);
