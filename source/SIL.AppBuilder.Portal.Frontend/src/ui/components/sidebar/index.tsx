import { connect } from 'react-redux';

import SidebarDisplay from './display';

import {
  toggleSidebar
} from '@store/user-interface';

const mapStateToProps = ({ ui }) => ({
  isSidebarVisible: ui.isSidebarVisible
});

const mapDispatchToProps = {
  toggleSidebar
}

export default connect(
  connect(mapStateToProps, mapDispatchToProps)
)(SidebarDisplay);