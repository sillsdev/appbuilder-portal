import * as React from 'react';
import { WithDataProps } from 'react-orbitjs';

import { ProductDefinitionResource, StoreTypeResource, StoreResource } from '@data';

import { IProvidedProps as IDataActionsProps } from '@data/containers/resources/project/with-data-actions';
import * as toast from '@lib/toast';
import { i18nProps } from '@lib/i18n';

interface INeededProps {
  isEmptyWorkflowProjectUrl: boolean;
  updateProduct: (
    definition: ProductDefinitionResource,
    storeType?: StoreResource
  ) => Promise<void>;
}

export interface IProvidedProps {
  productSelection: {
    isAddModalOpen: boolean;
    isDeleteModalOpen: boolean;
    toggleAddModal: () => void;
    toggleDeleteModal: () => void;
    storeNeededFor: ProductDefinitionResource;
    cancelStore: () => void;
    onChangeSelection: (definition: ProductDefinitionResource) => Promise<void>;
    onStoreSelect: (definition: ProductDefinitionResource, store?: StoreResource) => Promise<void>;
    storeType?: StoreTypeResource;
  };
}

type IProps = INeededProps & i18nProps & IDataActionsProps & WithDataProps;

interface IState {
  isAddModalOpen: boolean;
  isDeleteModalOpen: boolean;
  storeNeededFor?: ProductDefinitionResource;
  storeType?: StoreTypeResource;
}

export function withProductSelectionState<TWrappedProps>(WrappedComponent) {
  return class extends React.Component<IProps & TWrappedProps, IState> {
    state = {
      isAddModalOpen: false,
      isDeleteModalOpen: false,
      storeNeededFor: undefined,
      storeType: undefined,
    };

    toggleAddModal = () => this.setState({ isAddModalOpen: !this.state.isAddModalOpen });
    toggleDeleteModal = () => this.setState({ isDeleteModalOpen: !this.state.isDeleteModalOpen });
    showToast = () => toast.warning(this.props.t('project.products.creationInProgress'));

    handleProductAdd = async (definition: ProductDefinitionResource) => {
      // we are only here, because the product has not yet been added.
      // if the product needs a store, show the store selection modal,
      // otherwise go-ahead and add the product.
      const { dataStore } = this.props;
      const workflow = await dataStore.cache.query((q) =>
        q.findRelatedRecord(definition, 'workflow')
      );
      const storeType = await dataStore.cache.query((q) =>
        q.findRelatedRecord(workflow, 'storeType')
      );

      if (!storeType) {
        return await this.updateProduct(definition);
      }
      this.setState({ storeNeededFor: definition, storeType });
    };

    updateProduct = async (definition: ProductDefinitionResource, store?: StoreResource) => {
      const { t, updateProduct } = this.props;

      try {
        await updateProduct(definition, store);

        toast.success(t('updated'));
      } catch (e) {
        toast.error(e);
      }
    };

    onChangeSelection = async (definition: ProductDefinitionResource) => {
      const { productForProductDefinition } = this.props;

      const product = productForProductDefinition(definition);
      if (product) {
        return await this.updateProduct(definition);
      }
      return await this.handleProductAdd(definition);
    };

    cancelStore = () => {
      this.setState({ storeNeededFor: undefined });
    };

    render() {
      const { isAddModalOpen, isDeleteModalOpen, storeNeededFor, storeType } = this.state;

      const props = {
        ...this.props,
        productSelection: {
          isAddModalOpen,
          isDeleteModalOpen,
          toggleAddModal: this.toggleAddModal,
          toggleDeleteModal: this.toggleDeleteModal,
          onChangeSelection: this.onChangeSelection,
          storeNeededFor,
          onStoreSelect: this.updateProduct,
          cancelStore: this.cancelStore,
          storeType,
        },
      };

      return <WrappedComponent {...props} />;
    }
  };
}
