import * as React from 'react';
import { compose } from 'recompose';

import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import Display from './display';
import { query, buildOptions, withLoader } from '@data';
import { TYPE_NAME } from '@data/models/group';
import { withTranslations } from '@lib/i18n';


export default compose(
  query({
    groups: [q => q.findRecords(TYPE_NAME), buildOptions()]
  }),
  withLoader(({ groups }) => !groups),
  withTranslations,
)(Display);
