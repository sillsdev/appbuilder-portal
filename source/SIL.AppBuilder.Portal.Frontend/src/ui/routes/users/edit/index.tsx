import * as React from 'react';

import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Container } from 'semantic-ui-react';
import { withData as withOrbit } from 'react-orbitjs';


import * as toast from '@lib/toast';
import { getPictureUrl } from '@lib/auth0';
import { idFor, defaultOptions } from '@data';
import { UserAttributes, TYPE_NAME } from '@data/models/user';
import { withCurrentUser } from '@data/with-current-user';

import EditProfileForm from './form';
import { withData } from './with-data';
import './profile.scss';

export const pathName = '/users/:id/edit';

export interface IOwnProps {
  user: JSONAPI<UserAttributes>;
}

export type IProps =
  & IOwnProps
  & i18nProps;

class Profile extends React.Component<IProps> {

  state = {
    imageData: null
  };

  onChangePicture = (imageData) => {
    this.setState({imageData});
  }

  updateProfile = async (formData: UserAttributes): Promise<void> => {
    const { t, user } = this.props;
    const id = idFor(user);

    try {
      const { imageData } = this.state;

      await this.props.updateStore(tr => tr.replaceRecord({
        id,
        type: TYPE_NAME,
        attributes: { ...formData, imageData }
      }), defaultOptions());

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
  withCurrentUser(),
  withOrbit({}),
  withData,
  translate('translations')
)(Profile);
