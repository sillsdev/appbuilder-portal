import * as React from 'react';
import { withData, ILegacyProvidedProps } from 'react-orbitjs';
import { withRouter, RouterProps } from 'react-router';
import { compose } from 'recompose';
import * as toast from '@lib/toast';
import { OrganizationAttributes, TYPE_NAME } from '@data/models/organization';

import Display from './display';

import { withTranslations, i18nProps } from '~/lib/i18n';

export interface IOwnProps {
  token: string;
}
export type IProps = IOwnProps & ILegacyProvidedProps & RouterProps & i18nProps;

export interface IState {
  error: any;
}

export class CreateOrganizationForm extends React.Component<IProps, IState> {
  state = { error: undefined };

  submit = async (payload: OrganizationAttributes) => {
    try {
      const { t } = this.props;
      await this.create(payload);

      toast.success(t('org.createSuccess'));

      this.props.history.push('/');
    } catch (e) {
      this.setState({ error: e });
    }
  };

  create = async (payload: OrganizationAttributes) => {
    const { dataStore, token } = this.props;

    const { name, websiteUrl } = payload;

    return await dataStore.update((t) =>
      t.addRecord({
        type: TYPE_NAME,
        attributes: { name, websiteUrl, token },
      })
    );
  };

  render() {
    const { token } = this.props;
    const { error } = this.state;

    return <Display token={token} error={error} onSubmit={this.submit} />;
  }
}

export default compose<{}, IOwnProps>(
  withRouter,
  withData({}),
  withTranslations
)(CreateOrganizationForm);
