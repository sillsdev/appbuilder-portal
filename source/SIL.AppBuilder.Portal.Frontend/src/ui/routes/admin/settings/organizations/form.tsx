import * as React from 'react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { tomorrow } from '@lib/date';

import { OrganizationInviteAttributes } from '@data/models/organization-invite';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Checkbox } from 'semantic-ui-react';

import { listPathName } from './index';
import * as Toast from '@lib/toast';

import {
  withDataActions, IProvidedProps as IOrganizationProps
} from '@data/containers/resources/organization/with-data-actions';
import { debug } from 'util';

interface IOwnProps {
  toggleField: (fieldName: string, newToggleState: boolean) => void;
}

interface IState {
  name?: string;
  url?: string;
  buildEngineUrl?: string;
  buildEngineApiAccessToken?: string;
  logoUrl?: string;
  publicByDefault?: boolean;
}

type IProps =
  & i18nProps
  & IOwnProps
  & IOrganizationProps
  & RouteComponentProps<{}>;


@withTemplateHelpers
class AddNewOrganizationForm extends React.Component<IProps, IState> {
  mut: Mut;

  constructor(props) {
    super(props);

    const { name, websiteUrl, buildEngineUrl, buildEngineApiAccessToken, logoUrl, publicByDefault } = props;

    this.state = {
      name,
      url: websiteUrl,
      buildEngineUrl,
      buildEngineApiAccessToken,
      logoUrl,
      publicByDefault
    };
  }

  submit = async (e) => {
    e.preventDefault();
    const { createRecord } = this.props;
    try {
      await createRecord({
        name: this.state.name,
        websiteUrl: this.state.url,
        buildEngineUrl: this.state.buildEngineUrl,
        logoUrl: this.state.logoUrl
      });
      Toast.success('Organization added');
    } catch (e) {
      Toast.error(e);
    }
    this.setState({ name: '', url: '', buildEngineUrl: '', buildEngineApiAccessToken: '', logoUrl: '' });
  }

  cancel = (e) => {
    e.preventDefault();
    const { history } = this.props;
    history.push(listPathName);
  }
  toggle = (e, toggleData) => {

    const { toggleField } = this.props;

    const newToggleState = toggleData.checked;
debug;
    toggleField(toggleData.name, newToggleState);
  }
  render() {
    const { mut } = this;
    const { name, url, buildEngineUrl, buildEngineApiAccessToken, logoUrl, publicByDefault } = this.state;
    const { t } = this.props;

    return (
      <div className='flex invite-organization'>
        <form data-test-form className='ui form flex-grow'>

          <div className='field m-b-xl'>
            <label>{t('admin.settings.organizations.name')}</label>
            <input
              data-test-org-name
              type='text'
              value={name || ''}
              onChange={mut('name')} />
          </div>


          <div className='field m-b-xl'>
            <label>{t('admin.settings.organizations.websiteURL')}</label>
            <input
              data-test-org-url
              type='text'
              value={url || ''}
              onChange={mut('url')} />
          </div>

          <div className='field m-b-xl'>
            <label>{t('admin.settings.organizations.buildEngineURL')}</label>
            <input
              data-test-build-engine-url
              type='text'
              value={buildEngineUrl || ''}
              onChange={mut('buildEngineUrl')}
            />
          </div>

           <div className='field m-b-xl'>
            <label>{t('admin.settings.organizations.accessToken')}</label>
            <input
              data-test-build-engine-access-token
              type='text'
              value={buildEngineApiAccessToken || ''}
              onChange={mut('buildEngineApiAccessToken')}
            />
          </div>

          <div className='field m-b-xl'>
            <label>{t('admin.settings.organizations.logoURL')}</label>
            <input
              data-test-logo-url
              type='text'
              value={logoUrl || ''}
              onChange={mut('logoUrl')}
            />
          </div>
          <div className='flex justify-content-space-around border-none'>
            <div className='flex-grow'>
              <p className='field m-b-xl'>
                {t('admin.settings.organizations.publicByDefault')}
              </p>
            </div>
            <div className='flex-shrink'>
              <Checkbox
                data-test-build-engine-public-by-default
                toggle
                name='publicByDefault'
                defaultChecked={publicByDefault}
                onChange={this.toggle}
              />
            </div>
          </div>

          <button
            data-test-submit
            className='ui button p-t-md p-b-md p-l-lg p-r-lg'
            onClick={this.submit}>
            {t('admin.settings.organizations.add')}
          </button>

          <button
            data-test-cancel
            className='ui button p-t-md p-b-md p-l-lg p-r-lg'
            onClick={this.cancel}>
            {t('common.cancel')}
          </button>

        </form>
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withRouter,
  withDataActions
)(AddNewOrganizationForm);
