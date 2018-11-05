import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { withLoader } from '@data';

import Display from './display';
import { withTranslations } from '@lib/i18n';

export default compose(
  withTranslations,
  withOrbit(({ organization }) => ({
    groups: q => q.findRelatedRecords(organization, 'groups')
  })),
  withLoader(({ groups }) => !groups),
)(Display);
