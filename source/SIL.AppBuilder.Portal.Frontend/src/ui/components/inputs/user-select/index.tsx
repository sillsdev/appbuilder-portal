import { compose } from 'recompose';

import Display from './display';
import { withData } from './with-data';
import { IProps, IOwnProps } from './types';

export default compose<IProps, IOwnProps>(
  withData
)(Display);
