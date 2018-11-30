import * as React from 'react';
import * as Toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';

import {
  withDataActions,
  IProvidedProps as IOrganizationProps
} from '@data/containers/resources/organization/with-data-actions';

import OrganizationForm from '../common/form';

import { listPathName } from '../index';
import { query, withLoader, buildOptions, buildFindRecord, OrganizationResource, UserResource } from '@data';

interface IOwnProps {
  organization: OrganizationResource;
  owner: UserResource;
}

type IProps =
  & IOrganizationProps
  & IOwnProps
  & RouteComponentProps<{}>;

class EditOrganization extends React.Component<IProps> {

  update = async (attributes, onSuccess) => {

    const { updateAttributes, updateOwner } = this.props;

    try {
      await updateAttributes({
        name: attributes.name,
        websiteUrl: attributes.websiteUrl,
        buildEngineUrl: attributes.buildEngineUrl,
        buildEngineApiAccessToken: attributes.buildEngineApiAccessToken,
        logoUrl: attributes.logoUrl,
        publicByDefault: attributes.publicByDefault
      });
      await updateOwner(attributes.owner);
      onSuccess();
      this.redirectToList();
      Toast.success('Organization updated');
    } catch(e) {
      Toast.error(e);
    }
  }

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  }

  render() {
    const { organization, owner } = this.props;

    const organizationProps = {
      organization,
      owner,
      onSubmit: this.update,
      onCancel: this.redirectToList
    };

    return <OrganizationForm {...organizationProps} />;
  }
}

export default compose(
  withRouter,
  query(({ match: { params: { orgId } } }) => ({
    organization: [
      q => buildFindRecord(q, 'organization', orgId), buildOptions({
        include: ['owner']
      })
    ],
  })),
  withLoader(({ organization }) => !organization),
  withOrbit(({organization}) => ({
    owner: q => q.findRelatedRecord(organization, 'owner')
  })),
  withDataActions,
)(EditOrganization);

/*
 TODO:

 - load owner into form
 - create update function and hook it
 - fix sidebar navigation
 - add tests
*/