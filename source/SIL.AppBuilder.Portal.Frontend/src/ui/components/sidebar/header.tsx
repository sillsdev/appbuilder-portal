import * as React from 'react';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import CloseIcon from '@material-ui/icons/Close';
import { compose } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';
import { withRouter } from 'react-router-dom';

import { idFromRecordIdentity } from '@data';
import { OrganizationAttributes } from '@data/models/organization';
import { ORGANIZATIONS_TYPE, attributesFor } from '@data';
import { withCurrentOrganization } from '@data/containers/with-current-organization';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';
import { withRelationships } from '@data/containers/with-relationship';
export interface IProps {
  closeSidebar: () => void;
  className?: string;
  isOrgSwitcherActive: boolean;
  toggleOrgSwitcher: () => void;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  currentOrganization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

class SidebarHeader extends React.Component<IProps & i18nProps> {

  componentDidMount(){
    this.defaultSelectSingleOrgMembership();
  }

  componentDidUpdate(){
    this.defaultSelectSingleOrgMembership();
  }

  defaultSelectSingleOrgMembership(){
    const {organizations, currentOrganizationId, setCurrentOrganizationId} = this.props;

    if (organizations) {
      if (!currentOrganizationId && organizations.length === 1) {
        const id = idFromRecordIdentity(organizations[0] as any);
        setCurrentOrganizationId(id, false);
      }
    }
  }

  toggleOrgSwitcher = () => {
    const {toggleOrgSwitcher: toggle} = this.props;
    if (this.hasMoreThanOneOrg) {
      toggle();
    }
  }

  get hasMoreThanOneOrg() {
    const {organizations} = this.props;
    return (organizations && organizations.length > 1);
  }

  render() {
    const {
      closeSidebar, className,
      isOrgSwitcherActive,
      currentOrganization: org,
      t
    } = this.props;

    const icon = isOrgSwitcherActive ? <ArrowDropUp /> : <ArrowDropDown/>;
    const orgAttributes = attributesFor(org);
    const orgName = orgAttributes.name || t('org.allOrganizations');
    const bgClass = isOrgSwitcherActive ? 'bg-white' : '';

    const logoUrl = orgAttributes.logoUrl ?
      <img src={orgAttributes.logoUrl} /> :
      '\u00A0';

    return (
      <div className={`
        sidebar-title flex-row transition-all-fast
        align-items-center
        justify-content-space-between ${bgClass} ${className}`}
      >
        <div
          data-test-org-switcher-toggler
          className='switcher p-l-md no-select flex-row align-items-center'
          onClick={this.toggleOrgSwitcher}
        >
          <span
            className={`
              list-thumbnail m-r-md image-fill-container
              ${!orgAttributes.logoUrl && 'bg-white'}
            `}>
            {logoUrl}
          </span>
          <span className='bold blue-highlight'>{orgName}</span>
          { this.hasMoreThanOneOrg ? icon : null }
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
  withRouter,
  withCurrentUserContext,
  withCurrentOrganization,
  withRelationships((props: ICurrentUserProps) => {
    const { currentUser } = props;
    return {
      organizations: [currentUser, 'organizationMemberships', 'organization'],
    };
  }),
  withTranslations,

)(SidebarHeader);
