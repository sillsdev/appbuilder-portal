import { compose, withProps } from 'recompose';

import { withTranslations } from '@lib/i18n';
import { withNetwork as withProductDefinitions } from '@data/containers/resources/product-definition/list';
import { withLoader } from '@data/containers/with-loader';

//import { Display } from './display';
import { MultiSelect } from '@ui/components/inputs/multi-select';

export default compose(
  withTranslations,
  withProductDefinitions(),
  withLoader(({ error, productDefinitions }) => !error && !productDefinitions),
  withProps(({ productDefinitions, t }) => ({
    list: productDefinitions,
    relationshipName: 'productDefinition',
    emptyListLabel: t('org.noproducts')
  })),
)(MultiSelect);