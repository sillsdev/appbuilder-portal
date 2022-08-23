import React, { useState } from 'react';

import Header from './header';
import Navigation from './navigation';
import OrgSwitcher from './org-switcher';

import './sidebar.scss';

export interface IProps {
  closeSidebar: () => void;
  className?: string;
}

export default function Sidebar({ closeSidebar, className }: IProps) {
  const [isActive, setIsActive] = useState(false);
  const orgSwitchToggler = () => setIsActive((prev) => !prev);

  return (
    <div
      data-test-sidebar
      className={`sidebar bg-white border-right-dark overflows border-top-dark ${className}`}
    >
      <Header
        closeSidebar={closeSidebar}
        isOrgSwitcherActive={isActive}
        toggleOrgSwitcher={orgSwitchToggler}
      />

      {!isActive && <Navigation closeSidebar={closeSidebar} />}

      {isActive && <OrgSwitcher toggle={orgSwitchToggler} />}
    </div>
  );
}
