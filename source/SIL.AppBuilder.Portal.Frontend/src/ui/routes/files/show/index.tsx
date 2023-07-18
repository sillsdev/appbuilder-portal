import { compose } from 'recompose';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withTranslations } from '@lib/i18n';

import Display from './display';

export const pathName = '/files/:id';

export default compose(
  withTranslations,
  withCurrentUserContext
  // todo - extract this to a more general thing?
)(Display);
