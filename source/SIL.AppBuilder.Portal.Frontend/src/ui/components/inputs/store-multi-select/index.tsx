import { compose } from 'recompose';

import { withTranslations } from '@lib/i18n';
import { withNetwork as withStores } from '@data/containers/resources/store/list';
import { withLoader } from '@data/containers/with-loader';

import { Display } from './display';

export default compose(
  withStores(),
  withLoader(({ error, stores }) => !error && !stores),
  withTranslations,
)(Display);