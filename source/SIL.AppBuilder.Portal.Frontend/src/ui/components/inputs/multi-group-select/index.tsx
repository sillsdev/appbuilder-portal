import { compose } from 'recompose';

import { withData } from './with-data';
import Display from './display';

import { withGroupMemberships } from './with-group-memberships';

import './styles.scss';

export default compose(
  withData,
  withGroupMemberships()
)(Display);
