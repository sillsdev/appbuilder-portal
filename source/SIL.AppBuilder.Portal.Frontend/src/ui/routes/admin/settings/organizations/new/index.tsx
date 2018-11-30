import * as React from 'react';
import * as Toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  withDataActions,
  IProvidedProps as IOrganizationProps
} from '@data/containers/resources/organization/with-data-actions';

import OrganizationForm from '../common/form';

import { listPathName } from '../index';

type IProps =
  & IOrganizationProps
  & RouteComponentProps<{}>;

class NewOrganization extends React.Component<IProps> {

  save = async (attributes, onSuccess) => {

    const { createRecord } = this.props;

    try {
      await createRecord({
        name: attributes.name,
        websiteUrl: attributes.websiteUrl,
        buildEngineUrl: attributes.buildEngineUrl,
        buildEngineApiAccessToken: attributes.buildEngineApiAccessToken,
        logoUrl: attributes.logoUrl,
        publicByDefault: attributes.publicByDefault
      },{
        owner: attributes.owner
      });
      onSuccess();
      this.redirectToList();
      Toast.success('Organization added');
    } catch (e) {
      Toast.error(e);
    }
  }

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  }

  render() {

    const organizationProps = {
      onSubmit: this.save,
      onCancel: this.redirectToList
    };

    return <OrganizationForm {...organizationProps}/>;
  }

}

export default compose(
  withRouter,
  withDataActions
)(NewOrganization);