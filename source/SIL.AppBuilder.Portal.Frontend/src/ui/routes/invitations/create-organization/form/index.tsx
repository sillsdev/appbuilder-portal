import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { withRouter } from 'react-router'


import * as toast from '@lib/toast';
import { OrganizationAttributes, TYPE_NAME } from '@data/models/organization';

import Display from './display';

export type IProps =
  & { token: string }
  & WithDataProps;

@withRouter
@withData({})
export default class CreateOrganizationForm extends React.Component<IProps> {
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
