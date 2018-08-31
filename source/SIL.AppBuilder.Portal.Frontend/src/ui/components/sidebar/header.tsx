import * as React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { compose } from 'recompose';
import { withData, WithDataProps } from 'react-orbitjs';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { OrganizationAttributes } from '@data/models/organization';
import { withCurrentOrganization } from '@data/containers/with-current-organization';
import { ResourceObject } from 'jsonapi-typescript';
import { ORGANIZATIONS_TYPE } from '@data';

export interface IProps {
  closeSidebar: () => void;
  className?: string;
  isOrgSwitcherActive: boolean;
  toggleOrgSwitcher: () => void;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  currentOrganization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

const mapStateToProps = ({ data }) => ({
  currentOrganizationId: data.currentOrganizationId
});

class SidebarHeader extends React.Component<IProps & i18nProps> {
  render() {
    const {
      closeSidebar, className,
      isOrgSwitcherActive, toggleOrgSwitcher,
      currentOrganization: org,
      t
    } = this.props;

    const iconName = isOrgSwitcherActive ? 'caret up' : 'caret down';
    const orgAttributes = (org && org.attributes) || {};
    const orgName = orgAttributes.name || t('org.allOrganizations');
    const bgClass = isOrgSwitcherActive ? 'bg-white' : '';

    return (
      <div className={`
        sidebar-title flex-row transition-all-fast
        align-items-center
        justify-content-space-between ${bgClass} ${className}`}>

        <div
          data-test-org-switcher-toggler
          className='switcher p-l-md no-select flex-row align-items-center'
          onClick={toggleOrgSwitcher}>

          <span className='list-thumbnail m-r-md'>
            &nbsp;
          </span>
          <span className='bold blue-highlight'>{orgName}</span>
          <Icon name={iconName} size='large' />

        </div>


        <button
          data-test-sidebar-close-button
          className='close'
          onClick={closeSidebar}>

          <Icon name='close' size='large' />

        </button>
      </div>
    );
  }
}

export default compose(
  withCurrentOrganization,
  translate('translations')
)(SidebarHeader);
