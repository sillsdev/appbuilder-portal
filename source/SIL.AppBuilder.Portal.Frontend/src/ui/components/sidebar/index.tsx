import * as React from 'react';

import Header from './header';
import Navigation from './navigation';
import OrgSwitcher from './org-switcher';

import './sidebar.scss';

export interface IProps {
  closeSidebar: () => void;
  className?: string;
}

interface IState {
  isOrgSwitcherActive: boolean;
}

class Sidebar extends React.Component<IProps, IState> {
  state = { isOrgSwitcherActive: false };

  orgSwitchToggler = () => this.setState({ isOrgSwitcherActive: !this.state.isOrgSwitcherActive });

  render() {
    const { isOrgSwitcherActive } = this.state;
    const { closeSidebar, className } = this.props;

    return (
      <div
        data-test-sidebar
        className={`sidebar bg-white border-right-dark border-top-dark ${className}`}
      >
        <Header
          closeSidebar={closeSidebar}
          isOrgSwitcherActive={isOrgSwitcherActive}
          toggleOrgSwitcher={this.orgSwitchToggler}
        />

        {!isOrgSwitcherActive && <Navigation closeSidebar={closeSidebar} />}

        {isOrgSwitcherActive && <OrgSwitcher toggle={this.orgSwitchToggler} />}
      </div>
    );
  }
}

export default Sidebar;
