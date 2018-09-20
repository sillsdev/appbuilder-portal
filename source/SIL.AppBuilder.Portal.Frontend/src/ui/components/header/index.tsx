import { connect } from 'react-redux';
import { compose } from 'recompose';

import HeaderDisplay from './display';
import { showSidebar } from '@store/user-interface';

const mapStateToProps = ({ ui }) => ({
  isSidebarVisible: ui.isSidebarVisible
});

const mapDispatchToProps = (dispatch) => ({
  showSidebar: () => dispatch(showSidebar())
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps)
)(HeaderDisplay);
