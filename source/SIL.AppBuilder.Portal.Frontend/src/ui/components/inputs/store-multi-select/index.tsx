import { compose, withProps } from 'recompose';

import { StoreResource, StoreTypeResource, relationshipFor, idFor } from '@data';

import { withTranslations } from '@lib/i18n';
import { withNetwork as withStores } from '@data/containers/resources/store/list';
import { withLoader } from '@data/containers/with-loader';
import { MultiSelect } from '@ui/components/inputs/multi-select';

interface INeededProps {
  onChange: (store: StoreResource) => void;
  selected: StoreResource[];
  ofStoreType?: StoreTypeResource;
}

export default compose(
  withTranslations,
  withStores(),
  withLoader(({ error, stores }) => !error && !stores),
  withProps(({ stores, t, ofStoreType }) => ({
    list: (stores || []).filter((store) => {
      if (!ofStoreType) {
        return true;
      }
      return idFor(relationshipFor(store, 'storeType')) === ofStoreType.id;
    }),
    selectedItemJoinsWith: 'store',
    emptyListLabel: t('org.nostores'),
    displayProductIcon: false,
  }))
)(MultiSelect);
