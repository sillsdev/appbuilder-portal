import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';

import {
  withDataActions,
  IProvidedProps as IProductDefinitionProps
} from '@data/containers/resources/organization/with-data-actions';

import ProductDefinitionForm from '../common/form';

import { listPathName } from '../index';

import {
  query,
  withLoader,
  buildOptions,
  buildFindRecord,
  ProductDefinitionResource,
  UserResource
} from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  productDefinition: ProductDefinitionResource;
  owner: UserResource;
}

type IProps =
  & IProductDefinitionProps
  & IOwnProps
  & i18nProps
  & RouteComponentProps<{}>;

class EditProductDefinition extends React.Component<IProps> {

  update = async (attributes, relationships) => {
    const { updateAttributes, t } = this.props;
    await updateAttributes(attributes, relationships);
    this.redirectToList();
    toast.success(t('admin.settings.productDefinitions.editSuccess'));
  }

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  }

  render() {
    const { productDefinition, type, workflow } = this.props;

    const productDefinitionProps = {
      productDefinition,
      type,
      workflow,
      onSubmit: this.update,
      onCancel: this.redirectToList
    };

    return <ProductDefinitionForm {...productDefinitionProps} />;
  }
}

export default compose(
  withRouter,
  withTranslations,
  query(({ match: { params: { pdId } } }) => ({
    productDefinition: [
      q => buildFindRecord(q, 'productDefinition', pdId), buildOptions({
        include: ['type', 'workflow']
      })
    ],
  })),
  withLoader(({ productDefinition }) => !productDefinition),
  withOrbit(({ productDefinition}) => ({
    type: q => q.findRelatedRecord(productDefinition, 'type'),
    workflow: q => q.findRelatedRecord(productDefinition,'workflow')
  })),
  withDataActions,
)(EditProductDefinition);