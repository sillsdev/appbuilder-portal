import * as React from 'react';

import { compose } from 'recompose';
import { requireAuth } from '@lib/auth';
import { Container, Grid } from 'semantic-ui-react';

import { withData, WithDataProps } from 'react-orbitjs';

import EditProfileForm from './form';
import PictureProfile from './picture';

import * as toast from '@lib/toast';
import { UserAttributes, TYPE_NAME } from '@data/models/user';

import './profile.scss';

export const pathName = '/profile';

export interface IOwnProps { }
export type IProps =
  & IOwnProps
  & WithDataProps;

class Profile extends React.Component<IProps> {

  state = {
    imageData: null
  };

  onChangePicture = (imageData) => {
    this.setState({imageData});
  }

  updateProfile = async (formData: UserAttributes) => {
    try {
    
      const { imageData } = this.state;

      // TODO: we need an ID for the user so we can load it's data in 
      // componentWillMount
      await this.props.updateStore(t => t.replaceRecord({
        type: TYPE_NAME,
        attributes: { ...formData, imageData }
      }));

      toast.success(`User update successfully`);

    } catch (e) {
      toast.error(e.message);
    }
  }

  render() {
    return (
      <Container className='profile'>
        <h1 className='title'>Profile</h1>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4} className='text-center'>
              <h2>Profile Picture</h2>
              <PictureProfile onChange={this.onChangePicture}/>
            </Grid.Column>
            <Grid.Column width={12}>
              <h2>General</h2>
              <EditProfileForm onSubmit={this.updateProfile} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default compose(
  requireAuth,
  withData({})  
)(Profile);