import * as React from 'react';
import { withRouter, RouterProps } from 'react-router';
import { withData, WithDataProps } from 'react-orbitjs';

import * as toast from '@lib/toast';
import { OrganizationInviteAttributes, TYPE_NAME } from '@data/models/organization-invite';

import Display from './display';

export type IProps =
  & {}
  & RouterProps
  & WithDataProps;

export class InviteOrganization extends React.Component<IProps> {
  submit = async (payload: OrganizationInviteAttributes) => {
    try {
      await this.create(payload);

      toast.success(`Invitation sent`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  create = async (payload: OrganizationInviteAttributes) => {
    const { updateStore: update } = this.props;
    const { name, ownerEmail, expiresAt } = payload;

    return await update(t => t.addRecord({
      type: TYPE_NAME,
      attributes: { name, ownerEmail, expiresAt }
    }));
  }

  render() {
    return <Display onSubmit={this.submit} />;
  }
}

export default withRouter(withData({})(InviteOrganization));
