import { connect } from 'react-redux';
import { compose } from 'recompose';
import { showSidebar } from '@store/user-interface';

import HeaderDisplay from './display';

const mapStateToProps = ({ ui }) => ({
  isSidebarVisible: ui.isSidebarVisible,
});

const mapDispatchToProps = (dispatch) => ({
  showSidebar: () => dispatch(showSidebar()),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(HeaderDisplay);
