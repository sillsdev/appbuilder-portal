import { compose, withProps } from 'recompose';

import { StoreResource, attributesFor } from '@data';

import { compareVia } from '@lib/collection';
import { withTranslations } from '@lib/i18n';
import { withNetwork as withStores } from '@data/containers/resources/store/list';
import { withLoader } from '@data/containers/with-loader';
import { MultiSelect } from '@ui/components/inputs/multi-select';

export default compose(
  withTranslations,
  withStores(),
  withLoader(({ error, stores }) => !error && !stores),
  withProps(({ stores, t }) => ({
    stores:
      stores.sort(compareVia((store: StoreResource) => attributesFor(store).name.toLowerCase())) ||
      [],
    list: stores || [],
    selectedItemJoinsWith: 'store',
    emptyListLabel: t('org.nostores'),
    displayProductIcon: false,
  }))
)(MultiSelect);
