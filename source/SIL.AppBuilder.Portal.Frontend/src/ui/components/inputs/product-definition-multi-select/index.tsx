import { compose } from 'recompose';

import { withTranslations } from '@lib/i18n';
import { withNetwork as withProductDefinitions } from '@data/containers/resources/product-definition/list';
import { withLoader } from '@data/containers/with-loader';

import { Display } from './display';

export default compose(
  withProductDefinitions(),
  withLoader(({ error, productDefinitions }) => !error && !productDefinitions),
  withTranslations,
)(Display);