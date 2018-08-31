import * as React from 'react';
import { match as Match } from 'react-router';
import { OrganizationAttributes } from '@data/models/organization';

import Display from './display';
import { ResourceObject } from 'jsonapi-typescript';
import { ORGANIZATIONS_TYPE } from '@data';

export const pathName = '/organizations/:orgId/settings/infrastructure';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}


class InfrastructureRoute extends React.Component<IProps> {
  update = (attributes) => {
    const { update } = this.props;
    const {
      useSilBuildInfrastructure,
      buildEngineUrl, buildEngineApiAccessToken
    } = attributes;

    update({
      useSilBuildInfrastructure,
      buildEngineUrl,
      buildEngineApiAccessToken
    });
  }

  render() {
    const { organization } = this.props;
    const displayProps = {
      organization,
      onChange: this.update
    };

    return <Display { ...displayProps } />;
  }
}

export default InfrastructureRoute;
