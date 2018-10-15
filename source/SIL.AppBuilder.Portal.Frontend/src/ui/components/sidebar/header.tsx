import * as React from 'react';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import CloseIcon from '@material-ui/icons/Close';
import { compose } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';

import { OrganizationAttributes } from '@data/models/organization';
import { ORGANIZATIONS_TYPE, attributesFor } from '@data';
import { withCurrentOrganization } from '@data/containers/with-current-organization';
import { withTranslations, i18nProps } from '@lib/i18n';

export interface IProps {
  closeSidebar: () => void;
  className?: string;
  isOrgSwitcherActive: boolean;
  toggleOrgSwitcher: () => void;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  currentOrganization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

class SidebarHeader extends React.Component<IProps & i18nProps> {
  render() {
    const {
      closeSidebar, className,
      isOrgSwitcherActive, toggleOrgSwitcher,
      currentOrganization: org,
      t
    } = this.props;

    const icon = isOrgSwitcherActive ? <ArrowDropUp /> : <ArrowDropDown/>;
    const orgAttributes = attributesFor(org);
    const orgName = orgAttributes.name || t('org.allOrganizations');
    const bgClass = isOrgSwitcherActive ? 'bg-white' : '';

    const logoUrl = orgAttributes.logoUrl ?
      <img src={orgAttributes.logoUrl} width='32' height='32' /> : '\u00A0';

    return (
      <div className={`
        sidebar-title flex-row transition-all-fast
        align-items-center
        justify-content-space-between ${bgClass} ${className}`}
      >
        <div
          data-test-org-switcher-toggler
          className='switcher p-l-md no-select flex-row align-items-center'
          onClick={toggleOrgSwitcher}
        >
          <span className='list-thumbnail m-r-md'>{logoUrl}</span>
          <span className='bold blue-highlight'>{orgName}</span>
          { icon }
        </div>
        <button
          data-test-sidebar-close-button
          className='close d-lg-none'
          onClick={closeSidebar}
        >
          <CloseIcon />
        </button>
      </div>
    );
  }
}

export default compose(
  withCurrentOrganization,
  withTranslations
)(SidebarHeader);
