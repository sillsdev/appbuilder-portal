import * as React from 'react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { tomorrow } from '@lib/date';

import { OrganizationInviteAttributes } from '@data/models/organization-invite';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { listPathName } from './index';
import * as Toast from '@lib/toast';

import {
  withDataActions, IProvidedProps as IOrganizationProps
} from '@data/containers/resources/organization/with-data-actions';

interface IOwnProps {
  onSubmit: (data: OrganizationInviteAttributes) => Promise<void>;
  name?: string;
  orgAdminEmail?: string;
  websiteUrl?: string;
}

interface IState {
  name?: string;
  url?: string;
  buildEngineUrl?: string;
  buildEngineApiAccessToken?: string;
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

    const { name, websiteUrl, buildEngineUrl, buildEngineApiAccessToken } = props;

    this.state = {
      name,
      url: websiteUrl,
      buildEngineUrl,
      buildEngineApiAccessToken
    };
  }

  submit = async (e) => {
    e.preventDefault();
    const { createRecord } = this.props;
    try {
      await createRecord({
        name: this.state.name,
        websiteUrl: this.state.url,
        buildEngineUrl: this.state.buildEngineUrl
      });
      Toast.success('Organization added');
    } catch (e) {
      Toast.error(e);
    }
    this.setState({ name: '', url: '' });
  }

  cancel = (e) => {
    e.preventDefault();
    const { history } = this.props;
    history.push(listPathName);
  }

  render() {
    const { mut } = this;
    const { name, url, buildEngineUrl, buildEngineApiAccessToken } = this.state;
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
