import * as React from 'react';
import { match as Match, withRouter } from 'react-router';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { OrganizationAttributes } from '@data/models/organization';
import {
  OrganizationResource,
  OrganizationStoreResource,
  StoreResource,
  withLoader,
  query,
  buildFindRecord,
  buildOptions,
} from '@data';

import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';

import StoreMultiSelect from '@ui/components/inputs/store-multi-select';

import { withDataActions } from '~/data/containers/resources/organization/with-data-actions';

export const pathName = '/organizations/:orgId/settings/stores';

export interface Params {
  orgId: string;
}

export interface IOwnProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  updateOrganizationStore: (payload: StoreResource) => void;
  organization: OrganizationResource;
  organizationStores: OrganizationStoreResource[];
}

type IProps = IOwnProps & i18nProps;

export default compose<IProps, IOwnProps>(
  withTranslations,
  withRouter,
  query(({ match: { params: { orgId } } }) => ({
    organization: [
      q => buildFindRecord(q, 'organization', orgId),
      buildOptions({
        include: ['organization-stores.store'],
      }),
    ],
  })),
  withLoader(({ organization }) => !organization),
  withOrbit((passedProps: IOwnProps) => {
    const { organization } = passedProps;

    return {
      organizationStores: q => q.findRelatedRecords(organization, 'organizationStores'),
    };
  }),
  withLoader(({ organizationStores }) => !organizationStores),
  withDataActions,
  withProps(({ t, updateStore }) => {
    return {
      updateOrganizationStore: async st => {
        try {
          await updateStore(st);
          toast.success(t('updated'));
        } catch (e) {
          toast.error(e.message);
        }
      },
    };
  })
)(({ updateOrganizationStore, organizationStores, t }) => {
  const multiSelectProps = {
    selected: organizationStores,
    onChange: (store: StoreResource) => updateOrganizationStore(store),
  };

  return (
    <div className="sub-page-content" data-test-org-settings-stores>
      <h2 className="bold m-b-md">{t('org.storesTitle')}</h2>
      <h3 className="p-b-md">{t('org.storeSelectTitle')}</h3>
      <StoreMultiSelect {...multiSelectProps} />
    </div>
  );
});
