import React, { useCallback } from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';
import {
  OrganizationResource,
  ProductDefinitionResource,
  ProjectResource,
  ProductResource,
  relationshipFor,
} from '@data';
import { i18nProps } from '@lib/i18n';
import { attributesFor, pushPayload, useOrbit, idFromRecordIdentity } from 'react-orbitjs';
import { get as authenticatedGet } from '@lib/fetch';

import ProductDefinitionMultiSelect from './multi-select';

import { useConditionalPoll } from '~/lib/hooks';
import { isEmpty } from '~/lib/collection';

interface IProps {
  toggleAddModal: () => void;
  toggleDeleteModal: () => void;
  isAddModalOpen: boolean;
  isDeleteModalOpen: boolean;
  organization: OrganizationResource;
  selected: ProductResource[];
  project: ProjectResource;
  list: ProductDefinitionResource[];
  onChangeSelection: (definition: ProductDefinitionResource) => Promise<void>;
}

export default function ProductSelector(props: IProps & i18nProps) {
  const { dataStore } = useOrbit();
  const {
    t,
    toggleAddModal,
    toggleDeleteModal,
    isAddModalOpen,
    isDeleteModalOpen,
    organization,
    selected,
    project,
    onChangeSelection,
    list,
  } = props;
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

  useConditionalPoll(pollCallback, 3000);
  const inSelectedList = (element) => {
    const el = selected.find((selectedItem) => {
      const { data } = relationshipFor(selectedItem, 'productDefinition') || {};
      return data.id === element.id;
    });

    return el !== undefined;
  };

  let addEnabled = false;
  let removeEnabled = false;

  if (!isEmpty(list) && workflowProjectUrl) {
    list.map((element, index) => {
      const isSelected = inSelectedList(element);
      if (isSelected) {
        removeEnabled = true;
      } else {
        addEnabled = true;
      }
    });
  }

  return (
    <div>
      <Modal
        data-test-project-product-add-popup
        open={isAddModalOpen}
        trigger={
          <button
            data-test-project-products-add-button
            className='ui button fs-13 bold uppercase
            round-border-4 dark-blue-text
            thin-inverted-border bg-transparent'
            disabled={!addEnabled}
            onClick={toggleAddModal}
          >
            {t('project.products.add')}
          </button>
        }
        className='medium products-modal'
        closeIcon={<CloseIcon className='close-modal' />}
        onClose={toggleAddModal}
      >
        <Modal.Header>{t('project.products.popup.addTitle')}</Modal.Header>

        <Modal.Content>
          <ProductDefinitionMultiSelect
            organization={organization}
            selected={selected}
            project={project}
            list={list}
            onChangeSelection={onChangeSelection}
            selectedOnly={false}
          />
        </Modal.Content>
      </Modal>
      <Modal
        data-test-project-product-remove-popup
        open={isDeleteModalOpen}
        trigger={
          <button
            data-test-project-products-remove-button
            className='ui button fs-13 bold uppercase
            round-border-4 dark-blue-text
            thin-inverted-border bg-transparent'
            disabled={!removeEnabled}
            onClick={toggleDeleteModal}
          >
            {t('project.products.remove')}
          </button>
        }
        className='medium products-modal'
        closeIcon={<CloseIcon className='close-modal' />}
        onClose={toggleDeleteModal}
      >
        <Modal.Header>{t('project.products.popup.removeTitle')}</Modal.Header>

        <Modal.Content>
          <ProductDefinitionMultiSelect
            organization={organization}
            selected={selected}
            project={project}
            list={list}
            onChangeSelection={onChangeSelection}
            selectedOnly={true}
          />
        </Modal.Content>
      </Modal>
    </div>
  );
}
