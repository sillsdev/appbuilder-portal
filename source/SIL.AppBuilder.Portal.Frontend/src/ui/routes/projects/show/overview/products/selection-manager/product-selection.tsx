import React, { useCallback } from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';

import { OrganizationResource, ProductDefinitionResource, ProjectResource } from '@data';

import { i18nProps } from '@lib/i18n';
import { attributesFor, pushPayload, useOrbit, idFromRecordIdentity } from 'react-orbitjs';
import { get as authenticatedGet } from '@lib/fetch';

import ProductDefinitionMultiSelect from './multi-select';

import { useConditionalPoll } from '~/lib/hooks';

interface IProps {
  toggleModal: () => void;
  isModalOpen: boolean;
  organization: OrganizationResource;
  selected: ProductDefinitionResource[];
  project: ProjectResource;
  onChangeSelection: (definition: ProductDefinitionResource) => Promise<void>;
}

export default function ProductSelector(props: IProps & i18nProps) {
  const { dataStore } = useOrbit();
  const { t, toggleModal, isModalOpen, organization, selected, project, onChangeSelection } = props;
  const { workflowProjectUrl } = attributesFor(project);

  // there is a race condition where the page loads after
  // the backend has already sent the updated payload.
  // this happens because the repository location URL
  // is added async, and not part of the request.
  const pollCallback = useCallback(async () => {
    if (workflowProjectUrl) {
      return true;
    }

    try {
      const url = `projects/${idFromRecordIdentity(dataStore, project)}`;
      const response = await authenticatedGet(`/api/${url}`);
      const json = await response.json();

      await pushPayload(dataStore, json);

      const fromCache = dataStore.cache.query((q) => q.findRecord(project));

      const { workflowProjectUrl } = attributesFor(fromCache);

      return workflowProjectUrl;
    } catch (e) {
      return false;
    }
  }, [dataStore, project, workflowProjectUrl]);

  const { isFinished: hasUrl } = useConditionalPoll(pollCallback, 3000);

  return (
    <Modal
      data-test-project-product-popup
      open={isModalOpen}
      trigger={
        <button
          data-test-project-products-manage-button
          className='ui button fs-13 bold uppercase
            round-border-4 dark-blue-text
            thin-inverted-border bg-transparent'
          disabled={!workflowProjectUrl || !hasUrl}
          onClick={toggleModal}
        >
          {t('project.products.addRemove')}
        </button>
      }
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
}
