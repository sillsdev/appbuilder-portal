import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { withRouter, RouterProps } from 'react-router';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import * as toast from '@lib/toast';
import { OrganizationAttributes, TYPE_NAME } from '@data/models/organization';

import Display from './display';

export interface IOwnProps {
  token: string;
}
export type IProps = IOwnProps & WithDataProps & RouterProps & i18nProps;

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
    const { updateStore, token } = this.props;

    const { name, websiteUrl } = payload;

    return await updateStore((t) =>
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
  translate('translations')
)(CreateOrganizationForm);
