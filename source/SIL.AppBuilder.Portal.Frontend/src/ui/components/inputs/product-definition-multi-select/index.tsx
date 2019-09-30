import { compose, withProps } from 'recompose';
import { compareVia } from '@lib/collection';
import { withTranslations } from '@lib/i18n';
import { withNetwork as withProductDefinitions } from '@data/containers/resources/product-definition/list';

import { ProductDefinitionResource, attributesFor } from '@data';

import { withLoader } from '@data/containers/with-loader';
import { MultiSelect } from '@ui/components/inputs/multi-select';

export default compose(
  withTranslations,
  withProductDefinitions(),
  withLoader(({ error, productDefinitions }) => !error && !productDefinitions),
  withProps(({ productDefinitions, t }) => ({
    productDefinitions: productDefinitions.sort(
      compareVia((productDefinition: ProductDefinitionResource) =>
        attributesFor(productDefinition).name.toLowerCase()
      )
    ),
    list: productDefinitions,
    selectedItemJoinsWith: 'productDefinition',
    emptyListLabel: t('org.noproducts'),
    displayProductIcon: true,
  }))
)(MultiSelect);
