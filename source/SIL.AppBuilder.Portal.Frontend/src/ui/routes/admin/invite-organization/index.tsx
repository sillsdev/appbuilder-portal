import * as React from 'react';
import { withRouter, RouterProps } from 'react-router';
import { withData, WithDataProps } from 'react-orbitjs';
import { notify } from 'react-notify-toast';

import { OrganizationInviteAttributes } from '@data/models/organization-invite';

import Display from './display';

export type IProps =
  & {}
  & RouterProps
  & WithDataProps;

export class InviteOrganization extends React.Component<IProps> {
  submit = async (payload: OrganizationInviteAttributes) => {
    try {
      await this.create(payload);

      notify.show(`Invitation sent`, 'success');
    } catch (e) {
      notify.show(e.message, 'error');
    }
  }

  create = async (payload: OrganizationInviteAttributes) => {
    const { updateStore: update } = this.props;
    const { name, ownerEmail, expiresAt } = payload;

    return await update(t => t.addRecord({
      type: 'organizationInvite',
      attributes: { name, ownerEmail, expiresAt }
    }));
  }

  render() {
    return (
      <Display onSubmit={this.submit} />
    );
  }

}

export default withRouter(withData({})(InviteOrganization));
