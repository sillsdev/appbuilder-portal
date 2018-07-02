import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { withRouter, RouterProps } from 'react-router';
import { compose } from 'recompose';


import * as toast from '@lib/toast';
import { OrganizationAttributes, TYPE_NAME } from '@data/models/organization';

import Display from './display';

export interface IOwnProps { token: string; }
export type IProps =
  & IOwnProps
  & WithDataProps
  & RouterProps;

export class CreateOrganizationForm extends React.Component<IProps> {
  submit = async (payload: OrganizationAttributes) => {
    try {
      this.create(payload);

      toast.success(`Organization created successfully`);

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
  withData({})
)(CreateOrganizationForm);
