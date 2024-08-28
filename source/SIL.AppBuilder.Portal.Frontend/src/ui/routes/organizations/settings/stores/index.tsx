import * as React from 'react';
import { match as Match } from 'react-router';
import { compose, mapProps } from 'recompose';
import { withOrbit } from 'react-orbitjs';
import { OrganizationAttributes } from '@data/models/organization';
import { OrganizationResource, OrganizationStoreResource, StoreResource } from '@data';
import StoreMultiSelect from '@ui/components/inputs/store-multi-select';
import { useTranslations } from '@lib/i18n';
import { getPermissions } from '@lib/auth';

export const pathName = '/organizations/:orgId/settings/stores';

export interface Params {
  orgId: string;
}

export interface IExpectedProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  updateOrganizationStore: (payload: StoreResource) => void;
  organization: OrganizationResource;
}

export interface IFromOrbit {
  organizationStores: OrganizationStoreResource[];
}

export interface IProps {
  selected: OrganizationStoreResource[];
  onChange: (payload: StoreResource) => void;
}

export function StoresRoute({ selected, onChange }) {
  const { t } = useTranslations();

  return (
    <div className='sub-page-content' data-test-org-settings-stores>
      <h2 className='bold m-b-md'>{t('org.storesTitle')}</h2>
      <h3 className='p-b-md'>{t('org.storeSelectTitle')}</h3>

      <StoreMultiSelect {...{ onChange, readOnly: true, selected }} />
    </div>
  );
}

export default compose(
  withOrbit<IExpectedProps, IFromOrbit>((passedProps) => {
    const { organization } = passedProps;

    return {
      organizationStores: (q) => q.findRelatedRecords(organization, 'organizationStores'),
    };
  }),
  mapProps(({ organizationStores, updateOrganizationStore }) => {
    const { isSuperAdmin } = getPermissions();

    return {
      selected: organizationStores,
      onChange(store) {
        // if not superadmin, this onChange handler is a noop
        if (isSuperAdmin) {
          updateOrganizationStore(store);
        }
      },
    };
  })
)(StoresRoute);
