import * as React from 'react';
import { compose } from 'recompose';
import { withOrbit, useOrbit, attributesFor } from 'react-orbitjs';

import {
  defaultOptions,
  ProjectResource,
  ProductResource,
  GroupResource,
  UserResource,
  StoreResource,
  relationshipFor,
} from '@data';

import { useCurrentUser } from '@data/containers/with-current-user';
import { ProjectAttributes } from '@data/models/project';
import { recordIdentityFromKeys } from '@data/store-helpers';
import { requireProps } from '@lib/debug';
import * as toast from '@lib/toast';
import { useTranslations } from '@lib/i18n';
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

type IProps = IOwnProps;

export function useDataActions(project) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();

  const updateAttribute = async (attribute: string, value: any) => {
    await dataStore.update((q) => q.replaceAttribute(project, attribute, value), defaultOptions());
  };
  const updateAttributes = async (attributes: ProjectAttributes) => {
    const { id, type } = project;

    await dataStore.update(
      (q) =>
        q.replaceRecord({
          id,
          type,
          attributes,
        }),
      defaultOptions()
    );
  };

  const updateOwner = (user: UserResource | string) => {
    if (typeof user === 'string') {
      user = dataStore.cache.query((q) => q.findRecord({ type: 'user', id: user }));
    }

    return dataStore.update(
      (t) => t.replaceRelatedRecord(project, 'owner', user),
      defaultOptions()
    );
  };

  const updateGroup = (group: GroupResource | string) => {
    if (typeof group === 'string') {
      group = dataStore.cache.query((q) => q.findRecord({ type: 'group', id: group }));
    }

    return dataStore.update(
      (t) => t.replaceRelatedRecord(project, 'group', group),
      defaultOptions()
    );
  };

  const claimOwnership = async () => {
    try {
      await updateOwner(currentUser);

      toast.success(t('project.claimSuccess'));
    } catch (e) {
      toast.error(e);
    }
  };

  const toggleArchiveProject = async () => {
    const { dateArchived } = attributesFor(project);
    const nextValue = !dateArchived ? new Date() : null;

    try {
      await updateAttribute('dateArchived', nextValue);
      toast.success(
        !dateArchived
          ? t('project.operations.archive.success')
          : t('project.operations.reactivate.success')
      );
    } catch (e) {
      toast.error(e);
    }
  };

  return {
    updateAttribute,
    updateAttributes,
    updateOwner,
    updateGroup,
    toggleArchiveProject,
    claimOwnership,
  };
}

// TODO: remove this when withDataActions has been fully replaced by useDataACtions
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
      const { project, dataStore } = this.props;

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
    withOrbit((passedProps) => {
      const { project } = passedProps;

      return {
        products: (q) => q.findRecords('product').filter({ relation: 'project', record: project }),
      };
    }),
    requireProps('project')
  )(ProjectDataActionWrapper);
}
