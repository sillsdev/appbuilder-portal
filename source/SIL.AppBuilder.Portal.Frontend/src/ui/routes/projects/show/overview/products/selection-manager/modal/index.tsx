import * as React from 'react';
import { compose, withProps } from 'recompose';

import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';

import {
  withDataActions,
  IProvidedProps as IDataActionsProps,
} from '@data/containers/resources/project/with-data-actions';

import {
  ProductResource,
  ProductDefinitionResource,
  OrganizationResource,
  attributesFor,
  ProjectResource,
  StoreTypeResource,
  relationshipFor,
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
}

type IProps = IOwnProps & INeededProps & i18nProps & IDataActionsProps & IProductSelectionState;

export default compose<IProps, INeededProps>(
  withTranslations,
  withProps(({ project }) => {
    return {
      isEmptyWorkflowProjectUrl: isEmpty(attributesFor(project).workflowProjectUrl),
    };
  }),
  withDataActions,
  withProductSelectionState
  // withStoreSelectionState,
)(
  class ProductModal extends React.Component<IProps> {
    onStoreSelect = async (store: StoreTypeResource) => {
      console.log('selected', store);
    };


    render() {
      const { productSelection, t, selected, organization, project } = this.props;

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
              ...productSelection,
            }}
          />
        </>
      );
    }
  }
);
