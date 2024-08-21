import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  withDataActions,
  IProvidedProps as IOrganizationProps,
} from '@data/containers/resources/organization/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';

import OrganizationForm from '../common/form';
import { listPathName } from '../index';

type IProps = i18nProps & IOrganizationProps & RouteComponentProps<{}>;

class NewOrganization extends React.Component<IProps> {
  save = async (attributes, relationships) => {
    const { createRecord, t } = this.props;
    await createRecord(attributes, relationships);
    toast.success(t('admin.settings.organizations.addSuccess'));
    this.redirectToList();
  };

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  };

  render() {
    const organizationProps = {
      onSubmit: this.save,
      onCancel: this.redirectToList,
    };

    return <OrganizationForm {...organizationProps} />;
  }
}

export default compose(withTranslations, withRouter, withDataActions)(NewOrganization);
