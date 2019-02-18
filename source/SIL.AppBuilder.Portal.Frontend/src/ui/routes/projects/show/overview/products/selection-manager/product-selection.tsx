import * as React from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';

import { OrganizationResource, ProductDefinitionResource, ProjectResource } from '@data';

import { i18nProps } from '@lib/i18n';
import { attributesFor } from 'react-orbitjs/dist';

import ProductDefinitionMultiSelect from './multi-select';

interface IProps {
  toggleModal: () => void;
  isModalOpen: boolean;
  organization: OrganizationResource;
  selected: ProductDefinitionResource[];
  project: ProjectResource;
  onChangeSelection: (definition: ProductDefinitionResource) => Promise<void>;
}

export default (props: IProps & i18nProps) => {
  const { t, toggleModal, isModalOpen, organization, selected, project, onChangeSelection } = props;

  const trigger = (
    <button
      data-test-project-products-manage-button
      className='ui button fs-13 bold uppercase
      round-border-4 dark-blue-text
      thin-inverted-border bg-transparent'
      disabled={!attributesFor(project).workflowProjectUrl}
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
          onChangeSelection={onChangeSelection}
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
};
