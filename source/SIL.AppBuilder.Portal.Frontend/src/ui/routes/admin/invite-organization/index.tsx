import * as React from 'react';
import { withRouter, RouteProps } from 'react-router';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import * as toast from '@lib/toast';

import { defaultOptions } from '@data';

import { OrganizationInviteAttributes, TYPE_NAME } from '@data/models/organization-invite';
import { withQueryParams, IProvidedQueryParams } from '@lib/query-string';
import Header from '@ui/components/header/only-logo';
import { withTranslations, i18nProps } from '@lib/i18n';

import Display from './display';

export type IProps = {} & RouteProps & IProvidedQueryParams & WithDataProps & i18nProps;

export class InviteOrganization extends React.Component<IProps> {
  submit = async (payload: OrganizationInviteAttributes) => {
    try {
      await this.create(payload);

      toast.success(`Invitation sent`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  create = async (payload: OrganizationInviteAttributes) => {
    const { updateStore: update } = this.props;
    const { name, ownerEmail, expiresAt, url } = payload;

    return await update(
      (t) =>
        t.addRecord({
          type: TYPE_NAME,
          attributes: { name, ownerEmail, expiresAt, url },
        }),
      defaultOptions()
    );
  };

  render() {
    const { queryParams, t } = this.props;

    return (
      <div className='flex flex-column flex-grow'>
        <Header />
        <div className='ui container p-t-lg'>
          <h1 className='title page-heading-border p-b-md m-b-lg'>{t('newOrganization.title')}</h1>
          <div>
            <h3 className='m-b-lg'>{t('common.general')}</h3>
            <Display onSubmit={this.submit} {...queryParams} />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withRouter,
  withQueryParams,
  withData({}),
  withTranslations
)(InviteOrganization);
