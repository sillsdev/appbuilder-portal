import { compose } from 'recompose';

import { withTranslations } from '@lib/i18n' ;
import { withCurrentUser } from '@data/containers/with-current-user';
import { withCurrentOrganization, requireOrganizationToBeSelected } from '@data/containers/with-current-organization';

import { withData } from './with-data';
import { withAccessRestriction } from './with-access-restriction';
import Display from './display';

export const pathName = '/projects/new';


export default compose(
  withTranslations,
  withCurrentUser(),
  withCurrentOrganization,
  requireOrganizationToBeSelected,
  withData,
  withAccessRestriction
)( Display );
