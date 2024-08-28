import { compose } from 'recompose';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withTranslations } from '@lib/i18n';

import Display from './display';
import { withData } from './with-data';

export const pathName = '/products/:id/files';

export default compose(withTranslations, withCurrentUserContext, withData)(Display);
