import { compose, withProps } from 'recompose';

import { withTranslations } from '@lib/i18n';
import { withNetwork as withStores } from '@data/containers/resources/store/list';
import { withLoader } from '@data/containers/with-loader';

import { MultiSelect } from '@ui/components/inputs/multi-select';

export default compose(
  withTranslations,
  withStores(),
  withLoader(({ error, stores }) => !error && !stores),
  withProps(({ stores, t }) => ({
    list: stores,
    selectedItemJoinsWith: 'store',
    emptyListLabel: t('org.nostores'),
    displayProductIcon: false
  })),
)(MultiSelect);