import { compose } from 'recompose';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withTranslations } from '@lib/i18n';
import { withCurrentOrganization } from '@data/containers/with-current-organization';

import { withData } from './with-data';
import Display from './display';

export default compose(
  withCurrentUserContext,
  withCurrentOrganization,
  withData,
  withTranslations
)(Display);
