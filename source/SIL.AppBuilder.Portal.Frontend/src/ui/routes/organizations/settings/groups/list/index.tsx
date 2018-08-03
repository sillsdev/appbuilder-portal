import * as React from 'react';
import { compose } from 'recompose';

import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import Display from './display';
import { query } from '@data';
import { TYPE_NAME } from '@data/models/group';


export default compose(
  translate('translations'),
  query({
    groups: q => q.findRecords(TYPE_NAME)
  }),
)(Display);
