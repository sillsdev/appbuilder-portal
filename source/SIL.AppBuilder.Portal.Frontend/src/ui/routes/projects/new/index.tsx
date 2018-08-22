import * as React from 'react';
import { compose } from 'recompose';

import { withTranslations } from '@lib/i18n' ;

import { withData } from './with-data';
import Display from './display';

export const pathName = '/projects/new';


export default compose(
  withTranslations,
  withData
)( Display );
