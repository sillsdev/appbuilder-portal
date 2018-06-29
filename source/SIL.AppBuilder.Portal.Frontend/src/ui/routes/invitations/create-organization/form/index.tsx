import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';

import * as toast from '@lib/toast';
import { OrganizationAttributes, TYPE_NAME } from '@data/models/organization';

import Display from './display';

export type IProps =
  & {}
  & WithDataProps;

export class CreateOrganizationForm extends React.Component<IProps> {
  submit = async (payload: OrganizationAttributes) => {
    try {
      this.create(payload);

      toast.success(`Organization created successfully`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  create = async (payload: OrganizationAttributes) => {
    const { updateStore } = this.props;

    const { name, websiteUrl } = payload;

    return await updateStore(t => t.addRecord({
      type: TYPE_NAME,
      attributes: { name, websiteUrl }
    }));
  }

  render() {
    return <Display onSubmit={this.submit} />;
  }
}

export default withData({})(CreateOrganizationForm);
