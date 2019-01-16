import * as React from 'react';
import { Menu } from 'semantic-ui-react';
import { ResourceObject } from 'jsonapi-typescript';

import { attributesFor, ORGANIZATIONS_TYPE } from '@data';

import { OrganizationAttributes } from '@data/models/organization';

export interface IProps {
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  onClick: (e: any) => void;
  isActive: boolean;
}

class Row extends React.Component<IProps> {
  render() {
    const { isActive, organization, onClick } = this.props;
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
}

export default Row;
