import * as React from 'react';
import { withData } from 'react-orbitjs';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';

import { OrganizationAttributes, TYPE_NAME } from '../models/organization';
import { ORGANIZATIONS_TYPE } from '@data';

import { buildFindRecord } from '@data/store-helpers';

export interface IProvidedProps {
  currentOrganizationId: string | number;
  currentOrganization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

export interface IProps {
  currentOrganizationId: string | number;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

function mapStateToProps({ data }) {
  return {
    currentOrganizationId: data.currentOrganizationId
  };
}

function mapRecordsToProps(passedProps) {
  const { currentOrganizationId: id } = passedProps;

  if (!id || id === '') { return {}; }

  return {
    organization: q => buildFindRecord(q, TYPE_NAME, id)
  };
}

// all organizations the user can select have already been loaded from
// the with-current-user HOC
export function withCurrentOrganization(InnerComponent) {
  class WrapperClass extends React.Component<IProps> {
    render() {
      const { currentOrganizationId, organization } = this.props;

      const dataProps = {
        currentOrganization: organization || null,
        currentOrganizationId: currentOrganizationId || '',
      };

      return <InnerComponent { ...this.props } { ...dataProps } />;
    }
  }

  return compose(
    connect(mapStateToProps),
    withData(mapRecordsToProps)
  )(WrapperClass);
}
