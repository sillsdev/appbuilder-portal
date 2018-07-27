import * as React from 'react';

import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { requireAuth } from '@lib/auth';
import { Container, Grid } from 'semantic-ui-react';

import { withData, WithDataProps } from 'react-orbitjs';

import EditProfileForm from './form';

import * as toast from '@lib/toast';
import { getPictureUrl } from '@lib/auth0';
import { UserAttributes, TYPE_NAME } from '@data/models/user';

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
    const { t } = this.props;

    try {

      const { imageData } = this.state;

      // TODO: we need an ID for the user so we can load it's data in
      // componentWillMount
      await this.props.updateStore(tr => tr.replaceRecord({
        type: TYPE_NAME,
        attributes: { ...formData, imageData }
      }));

      toast.success(t('profile.updated'));

    } catch (e) {
      toast.error(e.message);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <Container className='profile'>
        <h1 className='title'>{t('profile.title')}</h1>
        <div>
          <h2>{t('profile.general')}</h2>
          <EditProfileForm onSubmit={this.updateProfile} />
        </div>
      </Container>
    );
  }
}

export default compose(
  requireAuth,
  withData({}),
  translate('translations')
)(Profile);
