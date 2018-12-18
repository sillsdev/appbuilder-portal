import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  withDataActions,
  IProvidedProps as IProductDefinitionProps
} from '@data/containers/resources/organization/with-data-actions';

import ProductDefinitionForm from '../common/form';

import { listPathName } from '../index';
import { withTranslations, i18nProps } from '@lib/i18n';

type IProps =
  & i18nProps
  & IProductDefinitionProps
  & RouteComponentProps<{}>;

class NewProductDefinition extends React.Component<IProps> {

  save = async (attributes, relationships) => {
    const { createRecord, t } = this.props;
    await createRecord(attributes, relationships);
    toast.success(t('admin.settings.productDefinitions.addSuccess'));
    this.redirectToList();
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

    return <ProductDefinitionForm {...organizationProps}/>;
  }

}

export default compose(
  withTranslations,
  withRouter,
  withDataActions
)(NewProductDefinition);