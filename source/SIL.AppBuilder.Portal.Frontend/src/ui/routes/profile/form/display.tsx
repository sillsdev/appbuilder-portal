import * as React from 'react';
import { withTemplateHelpers, Mut, ToggleHelper } from 'react-action-decorators';
import { Form, Divider, Checkbox, Button } from 'semantic-ui-react';

import TimezonePicker from 'react-timezone';

import { UserAttributes } from '@data/models/user';


export interface IProps {
  onSubmit: (data: UserAttributes) => Promise<void>;
}

export interface IState {
  name: string;
  email: string;
  localization: string;
  timezone: string;
  emailNotification: boolean;
  sshKey: string;
}


@withTemplateHelpers
export default class EditProfileDisplay extends React.Component<IProps, IState> {
  
  mut: Mut;
  toggle: ToggleHelper;
  
  state = { 
    name: '', 
    email: '', 
    localization: '', 
    timezone: '', 
    emailNotification: false, 
    sshKey: '' 
  };

  submit = async (e: React.MouseEvent<HTMLButtonElement>) => {

    e.preventDefault();

    const { onSubmit } = this.props;
    await onSubmit({ ...this.state });
  }  

  render() {
    const { mut, toggle } = this;
    const { 
      name, email, localization, 
      timezone, emailNotification, 
      sshKey 
    } = this.state;
    
    return (  
      <Form data-test-edit-profile>
        <Form.Field>
          <label>Name</label>
          <input 
            data-test-profile-name
            value={name}
            onChange={mut('name')} />
        </Form.Field>
        <Form.Field>
          <label>Email</label>
          <input
            data-test-profile-email
            value={email}
            onChange={mut('email')} />
        </Form.Field> 
        <Form.Field>
          <label>Location</label>
          <input
            data-test-profile-location
            value={localization}
            onChange={mut('location')} />
        </Form.Field>
        <Form.Field>
          <label>Timezone</label>
          <TimezonePicker
            className='timezone'
            value={timezone}
            onChange={mut('timezone')}
            inputProps={{
              placeholder: 'Select your Timezone...',
              name: 'timezone',
            }}
          />
        </Form.Field>
        <Divider horizontal/>
        <h2>Notification Settings</h2>
        <Form.Field>
          <Checkbox 
            toggle 
            label='I do not wish to recieve email notifications'
            onChange={toggle('emailNotification')}
            />
        </Form.Field>
        <Divider horizontal/>
        <h2>Manage Personal SSH KEY</h2>
        <Button
          data-test-profile-submit
          onClick={this.submit}>
        >
          Update Profile  
        </Button>
      </Form>
    )

  }

}