import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import {
  defaultOptions,
  ProjectResource,
  ProductResource,
  StoreResource,
  relationshipFor,
} from '@data';

import { ProjectAttributes } from '@data/models/project';
import { recordIdentityFromKeys } from '@data/store-helpers';
import { requireProps } from '@lib/debug';
import { ProductDefinitionResource } from '@data/models/product-definition';

export interface IProvidedProps {
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: ProjectAttributes) => any;
  updateGroup: (groupId: Id) => any;
  updateOwner: (userId: Id) => any;
  updateProduct: (productDefinition: ProductDefinitionResource) => any;
  productForProductDefinition: (productDefinition) => ProductResource;
}

interface IOwnProps {
  project: ProjectResource;
  products: ProductResource[];
}

type IProps = IOwnProps & WithDataProps;

const mapRecordsToProps = (passedProps) => {
  const { project } = passedProps;

  return {
    products: (q) => q.findRelatedRecords(project, 'products'),
  };
};

export function withDataActions<T>(WrappedComponent) {
  class ProjectDataActionWrapper extends React.Component<IProps & T> {
    updateAttribute = async (attribute: string, value: any) => {
      const { project, dataStore } = this.props;

      await dataStore.update(
        (q) => q.replaceAttribute(project, attribute, value),
        defaultOptions()
      );
    };

    updateAttributes = (attributes: ProjectAttributes) => {
      const { project, dataStore } = this.props;
      const { id, type } = project;

      return dataStore.update(
        (q) =>
          q.replaceRecord({
            id,
            type,
            attributes,
          }),
        defaultOptions()
      );
    };

    updateGroup = (groupId: Id) => {
      const { project, dataStore } = this.props;
      const recordIdentity = recordIdentityFromKeys(project);

      return dataStore.update(
        (q) => q.replaceRelatedRecord(recordIdentity, 'group', { type: 'group', id: groupId }),
        defaultOptions()
      );
    };

    updateOwner = (userId: Id) => {
      const { project, updateStore } = this.props;
      const recordIdentity = recordIdentityFromKeys(project);

      return updateStore(
        (q) => q.replaceRelatedRecord(recordIdentity, 'owner', { type: 'user', id: userId }),
        defaultOptions()
      );
    };

    productForProductDefinition = (productDefinition) => {
      const { products } = this.props;

      const matchingProduct = products.find((product) => {
        const { data } = relationshipFor(product, 'productDefinition');
        return data.id === productDefinition.id;
      });

      return matchingProduct;
    };

    updateProduct = (productDefinition, store?: StoreResource) => {
      const { project, products, dataStore } = this.props;

      const productSelected = this.productForProductDefinition(productDefinition);

      if (productSelected) {
        return dataStore.update((q) => q.removeRecord(productSelected), defaultOptions());
      }

      return dataStore.update(
        (q) =>
          q.addRecord({
            type: 'product',
            attributes: {},
            relationships: {
              project: { data: project },
              productDefinition: { data: productDefinition },
              store: { data: store || null },
            },
          }),
        defaultOptions()
      );
    };

    render() {
      const props = {
        ...this.props,
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
        updateGroup: this.updateGroup,
        updateOwner: this.updateOwner,
        updateProduct: this.updateProduct,
        productForProductDefinition: this.productForProductDefinition,
      };

      return <WrappedComponent {...props} />;
    }
  }

  return compose(
    withOrbit(mapRecordsToProps),
    requireProps('project')
  )(ProjectDataActionWrapper);
}
