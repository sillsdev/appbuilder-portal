import * as React from 'react';
import { DataProps } from 'react-orbitjs';

import { ProductDefinitionResource, StoreTypeResource, relationshipFor } from '@data';
import { IProvidedProps as IDataActionsProps } from '@data/containers/resources/project/with-data-actions';
import * as toast from '@lib/toast';
import { i18nProps } from '@lib/i18n';

interface INeededProps {
  isEmptyWorkflowProjectUrl: boolean;
  updateProduct: (definition: ProductDefinitionResource) => Promise<void>;
}

export interface IProvidedProps {
  productSelection: {
    isModalOpen: boolean;
    toggleModal: () => void;
    storeNeededFor: ProductDefinitionResource;
    cancelStore: () => void;
    onChangeSelection: (definition: ProductDefinitionResource) => Promise<void>;

  };
}

type IProps = INeededProps & i18nProps & IDataActionsProps & DataProps;

interface IState {
  isModalOpen: boolean;
  storeNeededFor?: ProductDefinitionResource;
  selectedProductStoreType?: StoreTypeResource;
}

export function withProductSelectionState<TWrappedProps>(WrappedComponent) {
  return class extends React.Component<IProps & TWrappedProps, IState> {
    state = { isModalOpen: false, storeNeededFor: undefined, storeType: undefined, };

    toggleModal = () => this.setState({ isModalOpen: !this.state.isModalOpen });
    showToast = () => toast.warning(this.props.t('project.products.creationInProgress'));

    handleProductAdd = async (definition: ProductDefinitionResource) => {
      // we are only here, because the product has not yet been added.
      // if the product needs a store, show the store selection modal,
      // otherwise go-ahead and add the product.
      const { t, updateProduct, dataStore } = this.props;
      const workflow = await dataStore.cache.query(q => q.findRelatedRecord(definition, 'workflow'));
      const storeType = await dataStore.cache.query(q => q.findRelatedRecord(workflow, 'storeType'));

      if (!storeType) {
        return await this.updateProduct(definition);
      }

      this.setState({ storeNeededFor: definition, storeType });
    };

    updateProduct = async (definition: ProductDefinitionResource) => {
      const { t, updateProduct } = this.props;

      try {
        await updateProduct(definition);

        toast.success(t('updated'));
      } catch (e) {
        toast.error(e.message);
      }
    };

    onChangeSelection = async (definition: ProductDefinitionResource) => {
      const { t, updateProduct, productForProductDefinition } = this.props;

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
      const { isEmptyWorkflowProjectUrl } = this.props;
      const { isModalOpen, storeNeededFor, storeType } = this.state;

      const toggleModal = isEmptyWorkflowProjectUrl ? this.showToast : this.toggleModal;
      const props = {
        ...this.props,
        productSelection: {
          isModalOpen,
          toggleModal: this.toggleModal,
          onChangeSelection: this.onChangeSelection,
          cancelStore: this.cancelStore,
          storeNeededFor,
          storeType,
        },
      };

      return <WrappedComponent {...props} />;
    }
  };
}
