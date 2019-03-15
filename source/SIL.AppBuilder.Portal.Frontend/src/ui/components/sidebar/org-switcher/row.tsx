import * as React from 'react';
import { Menu } from 'semantic-ui-react';

import { attributesFor } from '@data';

import { OrganizationResource } from '@data/models/organization';

export interface IProps {
  organization: OrganizationResource;
  onClick: (e: any) => void;
  isActive: boolean;
}

export default function Row(props: IProps) {
  const { isActive, organization, onClick } = props;
  const attributes = attributesFor(organization);
  const { name, logoUrl } = attributes;

  const className = `
          flex-row align-items-center
          ${isActive ? 'active' : ''}`;

  const logo = logoUrl ? <img src={logoUrl} /> : '\u00A0';

  return (
    <Menu.Item data-test-org-select-item className={className} name={name} onClick={onClick}>
      <span
        className={`
            list-thumbnail image-fill-container
            m-r-md ${!logoUrl && 'bg-lighter-gray'}
          `}
      >
        {logo}
      </span>

      <span>{name}</span>
    </Menu.Item>
  );
}
