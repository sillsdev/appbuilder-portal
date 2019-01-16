import * as React from 'react';
import { compose, withProps } from 'recompose';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';
import { withTemplateHelpers, Toggle } from 'react-action-decorators';
import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';

import ProductDefinitionMultiSelect from './multi-select';

import {
  ProductResource,
  ProductDefinitionResource,
  OrganizationResource,
  attributesFor,
  ProjectResource,
} from '@data';

interface INeededProps {
  organization: OrganizationResource;
  selected: ProductResource[];
  project: ProjectResource;
}

interface IOwnProps {
  isEmptyWorkflowProjectUrl: boolean;
}

type IProps = IOwnProps & INeededProps & i18nProps;

@withTemplateHelpers
class ProductModal extends React.Component<IProps> {
  toggle: Toggle;

  state = {
    isModalOpen: false,
  };

  showToast = () => toast.warning(this.props.t('project.products.creationInProgress'));

  render() {
    const { t, selected, organization, isEmptyWorkflowProjectUrl, project } = this.props;
    const { isModalOpen } = this.state;

    const toggleModal = isEmptyWorkflowProjectUrl ? this.showToast : this.toggle('isModalOpen');

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
          <ProductDefinitionMultiSelect
            organization={organization}
            selected={selected}
            project={project}
          />
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

export default compose<IProps, INeededProps>(
  withTranslations,
  withProps(({ project }) => {
    return {
      isEmptyWorkflowProjectUrl: isEmpty(attributesFor(project).workflowProjectUrl),
    };
  })
)(ProductModal);
