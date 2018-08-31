import * as React from 'react';
import { withTemplateHelpers, Mut, ToggleHelper } from 'react-action-decorators';
import { Form, Divider, Checkbox, Button, Icon, Grid } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import TimezonePicker from 'react-timezone';

import { UserAttributes } from '@data/models/user';
import { idFor, USERS_TYPE } from '@data';
import { ResourceObject } from 'jsonapi-typescript';

export interface IProps {
  user: ResourceObject<USERS_TYPE, UserAttributes>;
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  onSubmit: (data: IState) => Promise<void>;
}

export interface IState {
  givenName: string;
  familyName: string;
  email: string;
  phone: string;
  timezone: string;
  emailNotification: boolean;
  profileVisibility: number;
}

const PUBLIC_PROFILE = 1;
const PRIVATE_PROFILE = 0;

@withTemplateHelpers
class EditProfileDisplay extends React.Component<IProps & i18nProps, IState> {

  mut: Mut;
  toggle: ToggleHelper;
  timezoneInput: any;

  constructor(props) {
    super(props);

    const userAttributes = props.user.attributes;

    this.state = {
      ...userAttributes
    };
  }

  submit = async (e) => {
    e.preventDefault();
    const profileVisibility = this.state.profileVisibility ? PUBLIC_PROFILE : PRIVATE_PROFILE;
    await this.props.onSubmit({ ...this.state, profileVisibility });
  }

  render() {
    const { mut, toggle } = this;
    const {
      givenName, familyName, email, phone,
      timezone, emailNotification,
      profileVisibility
    } = this.state;

    const { t } = this.props;

    return (
      <Form data-test-edit-profile>
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Form.Field>
                <label>{t('profile.firstName')}</label>
                <input
                  data-test-profile-firstname
                  value={givenName || ''}
                  onChange={mut('givenName')} />
              </Form.Field>
            </Grid.Column>

            <Grid.Column>
              <Form.Field>
                <label>{t('profile.lastName')}</label>
                <input
                  data-test-profile-lastname
                  value={familyName || ''}
                  onChange={mut('familyName')} />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Form.Field>
          <label>{t('profile.email')}</label>
          <input
            data-test-profile-email
            value={email || ''}
            onChange={mut('email')} />
        </Form.Field>
        <Form.Field>
          <label>{t('profile.phone')}</label>
          <input
            data-test-profile-phone
            value={phone || ''}
            onChange={mut('phone')} />
        </Form.Field>

        <div className='flex-row justify-content-space-between'>
          <Form.Field>
            <label>{t('profile.timezone')}</label>
            <div
              data-test-profile-timezone
              className='timezone-group'
            >
              <Icon name='caret down'/>
              <TimezonePicker
                ref={input => this.timezoneInput = input}
                className='timezone'
                value={timezone || ''}
                onChange={tz => {
                  this.setState({timezone: tz});
                }}
                inputProps={{
                  placeholder: t('profile.timezonePlaceholder'),
                  name: 'timezone'
                }}
              />
            </div>
          </Form.Field>
        </div>

        <Divider horizontal/>

        <h2 className='form-title'>{t('profile.notificationSettingsTitle')}</h2>
        <Form.Field>
          <div className='toggle-selector'>
            <span>{t('profile.optOutOfEmailOption')}</span>
            <Checkbox
              data-test-profile-email-notification
              toggle
              defaultChecked={emailNotification}
              onChange={toggle('emailNotification')}
              />
          </div>
        </Form.Field>

        <Divider horizontal />

        <h2 className='form-title'>{t('profile.visibleProfile')}</h2>
        <Form.Field>
          <div className='toggle-selector'>
            <span data-test-profile-visible-text>{t('profile.visibility.visible')}</span>
            <Checkbox
              data-test-profile-visible-profile
              toggle
              defaultChecked={profileVisibility === PUBLIC_PROFILE}
              onChange={toggle('profileVisibility')}
            />
          </div>
        </Form.Field>

        <Divider horizontal />

        <Button
          data-test-profile-submit
          onClick={this.submit}
          className='form-button'
        >
          {t('common.save')}
        </Button>
      </Form>
    );

  }

}

export  default translate('translations')(EditProfileDisplay);
