import { compose } from 'recompose';

import Display from './display';
import { withList } from '@data/containers/resources/application-type/list';
import { withLoader } from '@data';

export default compose(
  withList(),
  withLoader(({ applicationTypes }) => !applicationTypes)
)(Display);