import * as React from 'react';
import { useOrbit } from 'react-orbitjs';
import * as toast from '@lib/toast';

import { defaultOptions } from '@data';

import { OrganizationInviteAttributes, TYPE_NAME } from '@data/models/organization-invite';
import { useQueryParams } from '@lib/query-string';
import { useTranslations } from '@lib/i18n';

import Display from './display';

export default function InviteOrganization() {
  const { t } = useTranslations();
  const { queryParams } = useQueryParams();
  const { dataStore } = useOrbit();
  const submit = async (payload: OrganizationInviteAttributes) => {
    try {
      await create(payload);

      toast.success(`Invitation sent`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const create = async (payload: OrganizationInviteAttributes) => {
    const { name, ownerEmail, expiresAt, url } = payload;

    return await dataStore.update(
      (t) =>
        t.addRecord({
          type: TYPE_NAME,
          attributes: { name, ownerEmail, expiresAt, url },
        }),
      defaultOptions()
    );
  };

  return (
    <div className='flex flex-column flex-grow'>
      <div className='ui container p-t-lg'>
        <h1 className='title page-heading-border p-b-md m-b-lg'>{t('newOrganization.title')}</h1>
        <div>
          <h3 className='m-b-lg'>{t('common.general')}</h3>
          <Display onSubmit={submit} {...queryParams} />
        </div>
      </div>
    </div>
  );
}
