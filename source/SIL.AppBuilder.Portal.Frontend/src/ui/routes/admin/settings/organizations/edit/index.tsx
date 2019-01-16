import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';
import {
  withDataActions,
  IProvidedProps as IOrganizationProps,
} from '@data/containers/resources/organization/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';

import OrganizationForm from '../common/form';
import { listPathName } from '../index';

import {
  query,
  withLoader,
  buildOptions,
  buildFindRecord,
  OrganizationResource,
  UserResource,
} from '@data';

interface IOwnProps {
  organization: OrganizationResource;
  owner: UserResource;
}

type IProps = IOrganizationProps & IOwnProps & i18nProps & RouteComponentProps<{}>;

class EditOrganization extends React.Component<IProps> {
  update = async (attributes, relationships) => {
    const { updateAttributes, t } = this.props;
    await updateAttributes(attributes, relationships);
    this.redirectToList();
    toast.success(t('admin.settings.organizations.editSuccess'));
  };

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  };

  render() {
    const { organization, owner } = this.props;

    const organizationProps = {
      organization,
      owner,
      onSubmit: this.update,
      onCancel: this.redirectToList,
    };

    return <OrganizationForm {...organizationProps} />;
  }
}

export default compose(
  withRouter,
  withTranslations,
  query(({ match: { params: { orgId } } }) => ({
    organization: [
      (q) => buildFindRecord(q, 'organization', orgId),
      buildOptions({
        include: ['owner'],
      }),
    ],
  })),
  withLoader(({ organization }) => !organization),
  withOrbit(({ organization }) => ({
    owner: (q) => q.findRelatedRecord(organization, 'owner'),
  })),
  withDataActions
)(EditOrganization);
