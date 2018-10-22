import * as React from 'react';
import { compose } from 'recompose';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';
import { withTemplateHelpers, Toggle } from 'react-action-decorators';

import { withTranslations, i18nProps } from '@lib/i18n';
import ProductDefinitionMultiSelect from './multi-select';
import { ProductResource, ProductDefinitionResource, OrganizationResource } from '@data';

interface IOwnProps {
  organization: OrganizationResource;
  selected: ProductResource[];
  onSelectionChange: (item: ProductDefinitionResource) => void;
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

  render() {

    const { t, selected, onSelectionChange, organization } = this.props;
    const { isModalOpen } = this.state;
    const toggleModal = this.toggle('isModalOpen');

    const multiSelectProps = {
      organization,
      selected,
      onChange: onSelectionChange
    };

    const trigger = (
      <button
        data-test-project-products-manage-button
        className='ui button'
        onClick={toggleModal}
      >
        {t('project.products.manage')}
      </button>
    );

    return (
      <Modal
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
  withTranslations
)(ProductModal);