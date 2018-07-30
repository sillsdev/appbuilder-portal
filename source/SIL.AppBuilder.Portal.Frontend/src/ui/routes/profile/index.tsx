import * as React from 'react';

import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { requireAuth } from '@lib/auth';
import { Container, Grid } from 'semantic-ui-react';

import { withData, WithDataProps } from 'react-orbitjs';

import EditProfileForm from './form';

import * as toast from '@lib/toast';
import { getPictureUrl } from '@lib/auth0';
import { idFor, defaultOptions } from '@data';
import { UserAttributes, TYPE_NAME } from '@data/models/user';
import { withCurrentUser } from '@data/with-current-user';

import './profile.scss';

export const pathName = '/profile';

export interface IOwnProps { }
export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps;

class Profile extends React.Component<IProps> {

  state = {
    imageData: null
  };

  onChangePicture = (imageData) => {
    this.setState({imageData});
  }

  updateProfile = async (formData: UserAttributes) => {
    const { t, currentUser } = this.props;
    const id = idFor(currentUser);

    try {

      const { imageData } = this.state;

      // TODO: we need an ID for the user so we can load it's data in
      // componentWillMount
      await this.props.updateStore(tr => tr.replaceRecord({
        id,
        type: TYPE_NAME,
        attributes: { ...formData, imageData }
      }), defaultOptions());

      toast.success(t('profile.updated'));

    } catch (e) {
      toast.error(e.message);
    }
  }

  render() {
    const { t, currentUser } = this.props;

    return (
      <Container className='profile'>
        <h1 className='title'>{t('profile.title')}</h1>
        <div>
          <h2>{t('profile.general')}</h2>
          <EditProfileForm user={currentUser} onSubmit={this.updateProfile} />
        </div>
      </Container>
    );
  }
}

export default compose(
  requireAuth,
  withData({}),
  withCurrentUser(),
  translate('translations')
)(Profile);
