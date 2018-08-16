import * as React from 'react';
import { withTemplateHelpers, Toggle } from 'react-action-decorators';
import './sidebar.scss';

import Header from './header';
import Navigation from './navigation';
import OrgSwitcher from './org-switcher';

export interface IProps {
  closeSidebar: () => void;
  className?: string;
}

@withTemplateHelpers
class Sidebar extends React.Component<IProps> {
  toggle: Toggle;

  state = { isOrgSwitcherActive: false };

  render() {
    const { isOrgSwitcherActive } = this.state;
    const { closeSidebar, className } = this.props;

    const orgSwitchToggler = this.toggle('isOrgSwitcherActive');

    return (
      <div
        data-test-sidebar
        className={`sidebar bg-white border-right-dark border-top-dark ${className}`}>

        <Header
          className='thin-bottom-border'
          closeSidebar={closeSidebar}
          isOrgSwitcherActive={isOrgSwitcherActive}
          toggleOrgSwitcher={orgSwitchToggler}
        />

        { !isOrgSwitcherActive && <Navigation closeSidebar={closeSidebar}/> }

        { isOrgSwitcherActive && <OrgSwitcher toggle={orgSwitchToggler} /> }

      </div>
    );
  }
}

export default Sidebar;
