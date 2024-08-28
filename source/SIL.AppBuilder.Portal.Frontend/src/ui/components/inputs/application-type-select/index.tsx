import { compose } from 'recompose';
import { withList } from '@data/containers/resources/application-type/list';
import { withLoader } from '@data';

import Display from './display';

export default compose(
  withList(),
  withLoader(({ applicationTypes }) => !applicationTypes)
)(Display);
