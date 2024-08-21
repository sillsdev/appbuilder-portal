import React, { useEffect, useCallback } from 'react';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import CloseIcon from '@material-ui/icons/Close';
import { ResourceObject } from 'jsonapi-typescript';
import { idFromRecordIdentity } from '@data';
import { OrganizationAttributes } from '@data/models/organization';
import { ORGANIZATIONS_TYPE, attributesFor } from '@data';
import { useCurrentOrganization } from '@data/containers/with-current-organization';
import { useTranslations } from '@lib/i18n';

export interface IProps {
  closeSidebar: () => void;
  isOrgSwitcherActive: boolean;
  toggleOrgSwitcher: () => void;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  currentOrganization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

// export default compose(
//   withRouter,
//   withCurrentUserContext,
//   withCurrentOrganization,
//   withRelationships((props: ICurrentUserProps) => {
//     const { currentUser } = props;

//     return {
//       organizations: [currentUser, 'organizationMemberships', 'organization'],
//     };
//   }),
//   withTranslations
// )(SidebarHeader);

export default function SidebarHeader(props: IProps) {
  const { toggleOrgSwitcher: toggle, closeSidebar, isOrgSwitcherActive } = props;
  const { t } = useTranslations();
  const {
    currentOrganization,
    organizationsAvailableToUser,
    currentOrganizationId,
    setCurrentOrganizationId,
  } = useCurrentOrganization();

  const hasMoreThanOneOrg = organizationsAvailableToUser.length > 1;

  useEffect(() => {
    if (!currentOrganizationId && organizationsAvailableToUser.length === 1) {
      const id = idFromRecordIdentity(organizationsAvailableToUser[0] as any);

      setCurrentOrganizationId(id, { skipNav: true });
    }
  }, [currentOrganizationId, organizationsAvailableToUser, setCurrentOrganizationId]);

  const toggleOrgSwitcher = useCallback(() => {
    if (hasMoreThanOneOrg) {
      toggle();
    }
  }, [hasMoreThanOneOrg, toggle]);

  const icon = isOrgSwitcherActive ? <ArrowDropUp /> : <ArrowDropDown />;
  const orgAttributes = attributesFor(currentOrganization);
  const orgName = orgAttributes.name || t('org.allOrganizations');
  const bgClass = isOrgSwitcherActive ? 'bg-white' : '';

  const logoUrl = orgAttributes.logoUrl ? <img src={orgAttributes.logoUrl} /> : '\u00A0';

  return (
    <div
      className={`
        sidebar-title flex-row transition-all-fast
        align-items-center thin-bottom-border
        justify-content-space-between ${bgClass}`}
    >
      <div
        data-test-org-switcher-toggler
        className='switcher p-l-md no-select flex-row align-items-center'
        onClick={toggleOrgSwitcher}
      >
        <span
          className={`
              list-thumbnail m-r-md image-fill-container
              ${!orgAttributes.logoUrl && 'bg-white'}
            `}
        >
          {logoUrl}
        </span>
        <span className='bold blue-highlight'>{orgName}</span>
        {hasMoreThanOneOrg ? icon : null}
      </div>
      <button data-test-sidebar-close-button className='close d-lg-none' onClick={closeSidebar}>
        <CloseIcon />
      </button>
    </div>
  );
}
