import * as React from 'react';
import { withRouter, RouteProps } from 'react-router';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';

import * as toast from '@lib/toast';
import { defaultOptions } from '@data';
import { OrganizationInviteAttributes, TYPE_NAME } from '@data/models/organization-invite';

import { withQueryParams, IProvidedQueryParams } from '@lib/query-string';

import Display, { IProps as DisplayProps } from './display';

export type IProps =
  & {}
  & RouteProps
  & IProvidedQueryParams
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
    }), defaultOptions());
  }

  render() {
    const { queryParams } = this.props;
    return <Display
      onSubmit={this.submit}
      { ...queryParams } />;
  }
}

export default compose(
  withRouter,
  withQueryParams,
  withData({})
)(InviteOrganization);
