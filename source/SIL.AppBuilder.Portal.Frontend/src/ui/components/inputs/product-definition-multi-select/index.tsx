import { compose, withProps } from 'recompose';

import { withTranslations } from '@lib/i18n';
import { withNetwork as withProductDefinitions } from '@data/containers/resources/product-definition/list';
import { withLoader } from '@data/containers/with-loader';

import { MultiSelect } from '@ui/components/inputs/multi-select';

export default compose(
  withTranslations,
  withProductDefinitions(),
  withLoader(({ error, productDefinitions }) => !error && !productDefinitions),
  withProps(({ productDefinitions, t }) => ({
    list: productDefinitions,
    selectedItemJoinsWith: 'productDefinition',
    emptyListLabel: t('org.noproducts'),
    displayProductIcon: true
  })),
)(MultiSelect);