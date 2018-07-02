import { connect } from 'react-redux';

import SidebarDisplay from './display';

import {
  toggleSidebar,
  setActiveMenu
} from '@store/user-interface';

const mapStateToProps = ({ ui }) => ({
  isSidebarVisible: ui.isSidebarVisible,
  activeMenu: ui.activeMenu
});

const mapDispatchToProps = dispatch => ({
  toggleSidebar: () => dispatch(toggleSidebar()),
  setActiveMenu: (menu: string) => dispatch(setActiveMenu(menu))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SidebarDisplay);
