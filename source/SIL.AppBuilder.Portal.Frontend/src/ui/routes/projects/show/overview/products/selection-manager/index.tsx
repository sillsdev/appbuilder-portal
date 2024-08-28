import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty, compareVia } from '@lib/collection';
import {
  withDataActions,
  IProvidedProps as IDataActionsProps,
} from '@data/containers/resources/project/with-data-actions';
import { withRelationships } from '@data/containers/with-relationship';
import {
  ProductDefinitionResource,
  OrganizationResource,
  attributesFor,
  ProjectResource,
  StoreResource,
} from '@data';

import {
  withProductSelectionState,
  IProvidedProps as IProductSelectionState,
} from './with-product-selection-state';
import ProductSelection from './product-selection';
import StoreSelection from './store-selection';

interface INeededProps {
  organization: OrganizationResource;
  selected: ProductDefinitionResource[];
  project: ProjectResource;
}

interface IOwnProps {
  isEmptyWorkflowProjectUrl: boolean;
  list: ProductDefinitionResource[];
}

type IProps = IOwnProps & INeededProps & i18nProps & IDataActionsProps & IProductSelectionState;

export default compose<IProps, INeededProps>(
  withTranslations,
  withRelationships(({ organization }: INeededProps) => {
    return {
      list: [organization, 'organizationProductDefinitions', 'productDefinition'],
    };
  }),
  withProps(({ project, list }) => {
    return {
      isEmptyWorkflowProjectUrl: isEmpty(attributesFor(project).workflowProjectUrl),
      list: list.sort(compareVia((pd) => attributesFor(pd).name)),
    };
  }),
  withDataActions,
  withProductSelectionState
)(
  class ProductModal extends React.Component<IProps> {
    onStoreSelect = async (store: StoreResource) => {
      const {
        storeNeededFor,
        onStoreSelect,
        cancelStore: closeStoreModal,
      } = this.props.productSelection;
      await onStoreSelect(storeNeededFor, store);

      closeStoreModal();
    };

    render() {
      const { productSelection, t, selected, organization, project, list } = this.props;

      const { storeNeededFor, cancelStore, storeType } = productSelection;

      return (
        <>
          {storeNeededFor && (
            <StoreSelection
              productDefinition={storeNeededFor}
              onStoreSelect={this.onStoreSelect}
              onStoreCancel={cancelStore}
              storeType={storeType}
              t={t}
            />
          )}

          <ProductSelection
            {...{
              t,
              selected,
              organization,
              project,
              list,
              ...productSelection,
            }}
          />
        </>
      );
    }
  }
);
