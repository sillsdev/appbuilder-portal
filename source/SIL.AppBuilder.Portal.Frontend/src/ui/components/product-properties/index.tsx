import React, { useCallback, useEffect, useState } from 'react';
import { Dropdown, Modal, Form } from 'semantic-ui-react';

import { ProductResource, attributesFor } from '~/data';

import { useTranslations } from '~/lib/i18n';

import CloseIcon from '@material-ui/icons/Close';
import { useDataActions } from '@data/containers/resources/product/with-data-action';
import * as toast from '@lib/toast';

export interface IProps {
  product: ProductResource;
}

const defaultProperties = `{
  "environment": {
      "BUILD_COMPUTE_TYPE": "small",
      "BUILD_IMAGE_TAG": "latest"
  }
}`;

export default function ProductProperties({ product }: IProps) {
  const { t } = useTranslations();
  const { updateAttribute } = useDataActions(product);
  const [properties, setProperties] = useState('');
  const [computeType, setComputeType] = useState('');
  const [open, setOpen] = useState(false);

  function resetState() {
    const attributes = attributesFor(product);
    const currentProperties = attributes.properties;
    setProperties(currentProperties);
    setComputeType(getComputeTypeFromProperties(currentProperties));
  }

  useEffect(() => {
    resetState();
  }, []);

  function getComputeTypeFromProperties(properties) {
    let computeType = '';
    if (properties) {
      const json = JSON.parse(properties);
      computeType = json['environment']['BUILD_COMPUTE_TYPE'];
    }
    return computeType;
  }

  function setDefaultProperties() {
    setProperties(defaultProperties);
  }

  const onSubmit = useCallback(async () => {
    try {
      await updateAttribute('properties', properties);
      setOpen(false);
    } catch (e) {
      toast.error(e);
    }
  }, [properties, updateAttribute]);

  const onCancel = () => {
    resetState();
    setOpen(false);
  };

  const computeOptions = [
    { key: 's', text: t('project.products.properties.small'), value: 'small' },
    { key: 'm', text: t('project.products.properties.medium'), value: 'medium' },
  ];

  const changeCompute = useCallback(
    (_, { value }) => {
      setComputeType(value);
      const newProperties = properties || defaultProperties;
      const json = JSON.parse(newProperties);
      json['environment']['BUILD_COMPUTE_TYPE'] = value;
      setProperties(JSON.stringify(json, null, 4));
    },
    [properties]
  );

  function changeProperties(event) {
    setProperties(event.target.value);
  }

  return (
    <Modal
      data-test-product-properties-modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Dropdown.Item
          data-test-product-properties-button
          key='Properties'
          text={t('project.products.popup.properties')}
        />
      }
      closeIcon={<CloseIcon data-test-product-properties-close className='close-modal' />}
      className='medium'
    >
      <Modal.Header>{t('project.products.properties.title')}</Modal.Header>
      <Modal.Content>
        <Form className='w-100'>
          <Form.Select
            fluid
            data-test-
            label={t('project.products.properties.computeType')}
            placeholder={t('project.products.properties.selectComputeType')}
            options={computeOptions}
            value={computeType}
            onChange={changeCompute}
          />
          <Form.Field className='flex-100'>
            <textarea
              data-test-properties
              value={properties}
              onChange={changeProperties}
              className='flex-100'
            ></textarea>
          </Form.Field>
        </Form>
        <div className='m-b-xl'>
          <button
            data-test-pp-default
            className='ui button p-t-md p-b-md p-l-lg p-r-lg'
            onClick={setDefaultProperties}
          >
            {t('common.default')}
          </button>
          <button
            data-test-wf-submit
            className='ui button p-t-md p-b-md p-l-lg p-r-lg'
            onClick={onSubmit}
          >
            {t('common.save')}
          </button>

          <button
            data-test-wf-cancel
            className='ui button p-t-md p-b-md p-l-lg p-r-lg'
            onClick={onCancel}
          >
            {t('common.cancel')}
          </button>
        </div>
      </Modal.Content>
    </Modal>
  );
}
