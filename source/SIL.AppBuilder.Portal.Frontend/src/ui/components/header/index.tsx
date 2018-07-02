import { connect } from 'react-redux';

import HeaderDisplay from './display';

<<<<<<< HEAD
import {
  toggleSidebar
} from '@store/user-interface';

const mapStateToProps = ({ ui }) => ({
  isSidebarVisible: ui.isSidebarVisible
});

const mapDispatchToProps = (dispatch) => ({
  toggleSidebar: () => dispatch(toggleSidebar())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderDisplay);
=======
// TODO: connect it to the notification store and logout action 
export default connect(null, {})(HeaderDisplay);
>>>>>>> master
