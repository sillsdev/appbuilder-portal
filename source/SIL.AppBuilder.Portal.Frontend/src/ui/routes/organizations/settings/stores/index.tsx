import * as React from 'react';
import { match as Match } from 'react-router';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { OrganizationAttributes } from '@data/models/organization';
import {
  OrganizationResource,
  OrganizationStoreResource,
  StoreResource
} from '@data';

import StoreMultiSelect from '@ui/components/inputs/store-multi-select';
import { withTranslations, i18nProps } from '@lib/i18n';

export const pathName = '/organizations/:orgId/settings/stores';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  updateOrganizationStore: (payload: StoreResource) => void;
  organization: OrganizationResource;
  organizationStores: OrganizationStoreResource[];
}

type IOwnProps =
  & IProps
  & i18nProps;

const mapRecordsToProps = (passedProps) => {
  const { organization } = passedProps;
  const { type, id } = organization;

  return {
    organizationStores: q => q.findRelatedRecords({ type, id }, 'organizationStores')
  };
};

class StoresRoute extends React.Component<IOwnProps> {

  togglePrivacy = () => {
    const { update, organization } = this.props;
    const { makePrivateByDefault } = organization.attributes;

    update({ makePrivateByDefault: !makePrivateByDefault });
  }

  updateOrganizationStore = (store) => {

    const { updateOrganizationStore } = this.props;

    updateOrganizationStore(store);
  }

  render() {
    const { organizationStores, t } = this.props;

    const multiSelectProps = {
      selected: organizationStores,
      onChange: this.updateOrganizationStore
    };

    return (
      <div className='sub-page-content' data-test-org-settings-stores>
        <h2 className='bold m-b-md'>{t('org.storesTitle')}</h2>
        <h3 className='p-b-md'>{t('org.storeSelectTitle')}</h3>
        <StoreMultiSelect {...multiSelectProps} />
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit(mapRecordsToProps),
)(StoresRoute);
