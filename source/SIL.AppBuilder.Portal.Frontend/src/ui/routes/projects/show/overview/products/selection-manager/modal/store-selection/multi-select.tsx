import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import {
  StoreResource,
  StoreTypeResource,
  relationshipFor,
  idFor,
  idsForRelationship,
} from '@data';

import { withTranslations } from '@lib/i18n';
import { withNetwork as withOrganizationStores } from '@data/containers/resources/organization-store/list';
import { withLoader } from '@data/containers/with-loader';
import { MultiSelect } from '@ui/components/inputs/multi-select';

interface INeededProps {
  onChange: (store: StoreResource) => void;
  selected: StoreResource[];
  ofStoreType: StoreTypeResource;
}

export default compose(
  withTranslations,
  withOrganizationStores(),
  withLoader(({ error, organizationStores }) => !error && !organizationStores),
  withOrbit({
    stores: (q) => q.findRecords('store'),
  }),
  withProps(({ stores, t, ofStoreType, organizationStores }) => {
    const storeIdsForOrg = idsForRelationship(organizationStores, 'store');

    return {
      list: (stores || [])
        .filter((store) => {
          return idFor(relationshipFor(store, 'storeType')) === ofStoreType.id;
        })
        .filter((store) => {
          return storeIdsForOrg.includes(store.id);
        }),
      selectedItemJoinsWith: 'store',
      emptyListLabel: t('products.noStoresAvailable'),
      displayProductIcon: false,
    };
  })
)(MultiSelect);
