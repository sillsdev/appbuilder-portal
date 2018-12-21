import * as React from 'react';
import { compose, withProps } from 'recompose';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';
import { withTemplateHelpers, Toggle } from 'react-action-decorators';
import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';
import ProductDefinitionMultiSelect from './multi-select';
import { ProductResource, ProductDefinitionResource, OrganizationResource, attributesFor } from '@data';
import { isEmpty } from '@lib/collection';
import {
  withDataActions,
  IProvidedProps as IDataActionsProps
} from '@data/containers/resources/project/with-data-actions';

interface IOwnProps {
  organization: OrganizationResource;
  selected: ProductResource[];
  onSelectionChange: (item: ProductDefinitionResource) => void;
  isEmptyWorkflowProjectUrl: boolean;
}

interface IPendingUpdates {
  [itemId: string]: boolean;
}


type IProps =
  & IOwnProps
  & i18nProps;

 @withTemplateHelpers
 class ProductModal extends React.Component<IProps> {

  toggle: Toggle;

  state = {
    isModalOpen: false
  };

  showToast = () => toast.warning(this.props.t('project.products.creationInProgress'));

  pendingUpdates: IPendingUpdates = {};

  onSelectionChange = async (item: ProductDefinitionResource) => {
    if (!this.pendingUpdates[item.id]){
      this.pendingUpdates[item.id] = true;
      const { t, updateProduct } = this.props;
      try {
        await updateProduct(item);
        toast.success(t('updated'));
      } catch (e) {
        toast.error(e.message);
      }
      delete this.pendingUpdates[item.id];
    }
  }

  render() {

    const { t, selected, organization, isEmptyWorkflowProjectUrl } = this.props;
    const { isModalOpen } = this.state;

    const toggleModal = isEmptyWorkflowProjectUrl ? this.showToast : this.toggle('isModalOpen');

    const multiSelectProps = {
      organization,
      selected,
      onChange: this.onSelectionChange
    };

    const trigger = (
      <button
        data-test-project-products-manage-button
        className='ui button fs-13 bold uppercase
        round-border-4 dark-blue-text
        thin-inverted-border bg-transparent'
        onClick={toggleModal}
      >
        {t('project.products.addRemove')}
      </button>
    );

    return (
      <Modal
        data-test-project-product-popup
        open={isModalOpen}
        trigger={trigger}
        className='medium products-modal'
        closeIcon={<CloseIcon className='close-modal' />}
        onClose={toggleModal}
      >
        <Modal.Header>{t('project.products.popup.title')}</Modal.Header>
        <Modal.Content>
          <ProductDefinitionMultiSelect {...multiSelectProps} />
        </Modal.Content>
        <Modal.Actions>
          <button
            data-test-project-product-close-button
            className='ui button huge'
            onClick={toggleModal}
          >
            {t('project.products.popup.done')}
          </button>
        </Modal.Actions>
      </Modal>
    );
  }

}

export default compose(
  withTranslations,
  withDataActions,
  withProps(({project}) => {
    return {
      isEmptyWorkflowProjectUrl: isEmpty(
        attributesFor(project).workflowProjectUrl
      )
    };
  })
)(ProductModal);
