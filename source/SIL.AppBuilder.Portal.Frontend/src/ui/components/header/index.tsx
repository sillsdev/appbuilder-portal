import { connect } from 'react-redux';
import { compose } from 'recompose';

import HeaderDisplay from './display';

import {
  toggleSidebar
} from '@store/user-interface';

const mapStateToProps = ({ ui }) => ({
  isSidebarVisible: ui.isSidebarVisible
});

const mapDispatchToProps = (dispatch) => ({
  toggleSidebar: () => dispatch(toggleSidebar())
});

export default compose(
  connect(mapStateToProps,mapDispatchToProps)
)(HeaderDisplay);
