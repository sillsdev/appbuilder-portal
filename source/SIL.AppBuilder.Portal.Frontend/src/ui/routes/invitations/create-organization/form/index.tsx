import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { withRouter, RouterProps } from 'react-router';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';


import * as toast from '@lib/toast';
import { OrganizationAttributes, TYPE_NAME } from '@data/models/organization';

import Display from './display';

export interface IOwnProps { token: string; }
export type IProps =
  & IOwnProps
  & WithDataProps
  & RouterProps
  & i18nProps;

export class CreateOrganizationForm extends React.Component<IProps> {
  submit = async (payload: OrganizationAttributes) => {
    try {
      const { t } = this.props;
      this.create(payload);

      toast.success(t('org.createSuccess'));

      this.props.history.push('/');
    } catch (e) {
      toast.error(e.message);
    }
  }

  create = async (payload: OrganizationAttributes) => {
    const { updateStore, token } = this.props;

    const { name, websiteUrl } = payload;

    return await updateStore(t => t.addRecord({
      type: TYPE_NAME,
      attributes: { name, websiteUrl, token }
    }));
  }

  render() {
    const { token } = this.props;

    return <Display token={token} onSubmit={this.submit} />;
  }
}

export default compose<{}, IOwnProps>(
  withRouter,
  withData({}),
  translate('translations')
)(CreateOrganizationForm);
