import * as React from 'react';
import { compose } from 'recompose';
import { Checkbox } from 'semantic-ui-react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import TimezonePicker from 'react-timezone';

import {
  withTemplateHelpers, Mut, ToggleHelper
} from 'react-action-decorators';

import { UserResource } from '@data/models/user';
import { withTranslations, i18nProps } from '@lib/i18n';

export interface IProps {
  user: UserResource;
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
      <form data-test-edit-profile className='ui form'>
        <div className='flex'>
          <div className='flex w-100'>
            <div className='field w-50-md p-r-lg'>
              <label>{t('profile.firstName')}</label>
              <input
                data-test-profile-firstname
                value={givenName || ''}
                onChange={mut('givenName')} />
            </div>
            <div className='field w-50-md'>
              <label>{t('profile.lastName')}</label>
              <input
                data-test-profile-lastname
                value={familyName || ''}
                onChange={mut('familyName')} />
            </div>
          </div>
        </div>
        <div className='field w-50-md p-r-lg m-t-lg'>
          <label>{t('profile.email')}</label>
          <input
            data-test-profile-email
            value={email || ''}
            onChange={mut('email')} />
        </div>
        <div className='field w-50-md  p-r-lg m-t-lg'>
          <label>{t('profile.phone')}</label>
          <input
            data-test-profile-phone
            value={phone || ''}
            onChange={mut('phone')} />
        </div>
        <div className='field w-50-md p-r-lg m-t-lg'>
          <label>{t('profile.timezone')}</label>
          <div
            data-test-profile-timezone
            className='position-relative'
          >
            <ArrowDropDownIcon className='timezone-icon'/>
            <TimezonePicker
              ref={input => this.timezoneInput = input}
              className='w-100'
              value={timezone || ''}
              onChange={tz => {
                this.setState({timezone: tz});
              }}
              inputProps={{
                placeholder: t('profile.timezonePlaceholder'),
                className: 'bg-transparent',
                name: 'timezone'
              }}
            />
          </div>
        </div>

        <div className='ui divider m-t-xl m-b-xl' />

        <h2 className='fs-21 bold gray-text m-b-lg'>
          {t('profile.notificationSettingsTitle')}
        </h2>
        <div className='field flex align-items-center'>
          <span className='fs-16 m-r-md bold gray-text'>
            {t('profile.optOutOfEmailOption')}
          </span>
          <Checkbox
            data-test-profile-email-notification
            toggle
            defaultChecked={emailNotification}
            onChange={toggle('emailNotification')}
            />
        </div>
        <div className='ui divider m-t-xl m-b-xl' />
        <h2 className='fs-21 bold gray-text m-b-lg'>
          {t('profile.visibleProfile')}
        </h2>
        <div className='field flex align-items-center'>
          <span data-test-profile-visible-text className='fs-16 m-r-md bold gray-text'>
            {t('profile.visibility.visible')}
          </span>
          <Checkbox
            data-test-profile-visible-profile
            toggle
            defaultChecked={profileVisibility === PUBLIC_PROFILE}
            onChange={toggle('profileVisibility')}
          />
        </div>
        <div className='ui divider m-t-xl m-b-xl' />
        <button
          data-test-profile-submit
          onClick={this.submit}
          className='ui button massive bold fs-21 m-b-xl'
        >
          {t('common.save')}
        </button>
      </form>
    );

  }

}

export  default compose(
  withTranslations
)(EditProfileDisplay);
