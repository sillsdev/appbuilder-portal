import * as React from 'react';
import CreateIcon from '@material-ui/icons/Create';
import StoreIcon from '@material-ui/icons/Shop';
import SyncIcon from '@material-ui/icons/Sync';
import { useOrbit, localIdFromRecordIdentity } from 'react-orbitjs';
import { useRedux } from 'use-redux';

import { attributesFor, idFromRecordIdentity, OrganizationResource, UserResource } from '@data';

import { useTranslations } from '@lib/i18n';
import { Link } from 'react-router-dom';

import { setCurrentOrganization } from '~/redux-store/data';

interface IOwnProps {
  organization: OrganizationResource;
}

export default function OrganizationItem({ organization }: IOwnProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const [, dispatch] = useRedux();

  const owner = dataStore.cache.query((q) => q.findRelatedRecord(organization, 'owner'));

  const { name, websiteUrl, buildEngineUrl, buildEngineApiAccessToken } = attributesFor(
    organization
  );

  const remoteId = idFromRecordIdentity(organization as any);

  const switchToOrg = () => {
    dispatch(setCurrentOrganization(remoteId));
  };

  return (
    <div className='flex p-md fs-13 m-b-sm thin-border round-border-4'>
      <div className='flex-grow'>
        <div className='bold fs-16'>
          <button className='m-r-md' onClick={switchToOrg}>
            <SyncIcon className='fs-16' /> Switch Context
          </button>
          {name}
        </div>
        <div className='p-t-md'>
          <span className='bold m-r-sm'>{t('admin.settings.organizations.owner')}:</span>
          <span>{attributesFor(owner).name}</span>
        </div>
        <div>
          <span className='bold m-r-sm'>{t('admin.settings.organizations.websiteURL')}:</span>
          <span>{websiteUrl}</span>
        </div>
        <div>
          <span className='bold m-r-sm'>{t('admin.settings.organizations.buildEngineURL')}:</span>
          <span>{buildEngineUrl}</span>
        </div>
        <div>
          <span className='bold m-r-sm'>{t('admin.settings.organizations.accessToken')}:</span>
          <span>{buildEngineApiAccessToken}</span>
        </div>
      </div>
      <div className='flex-column'>
        <Link className='gray-text' to={`/admin/settings/organizations/${remoteId}/edit`}>
          <CreateIcon className='fs-16' />
        </Link>
        <Link className='gray-text' to={`/admin/settings/organizations/${remoteId}/stores`}>
          <StoreIcon className='fs-16' />
        </Link>
      </div>
    </div>
  );
}
