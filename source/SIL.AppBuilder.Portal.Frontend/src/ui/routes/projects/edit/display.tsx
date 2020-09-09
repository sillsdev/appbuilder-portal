import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Checkbox } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { ProjectResource, attributesFor } from '@data';

import { useDataActions } from '@data/containers/resources/project/with-data-actions';
import { useTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';

import { useRouter } from '~/lib/hooks';

import { withValue } from '~/lib/dom';

import AutoSavingInput from '@ui/components/inputs/auto-saving-input';
import { idFromRecordIdentity, useOrbit } from 'react-orbitjs/dist';

interface IProps {
  project: ProjectResource;
}

export default function Details({ project }: IProps) {
  const { t } = useTranslations();
  const { history } = useRouter();
  const { dataStore } = useOrbit();
  const { updateAttributes } = useDataActions(project);
  const [newName, setNewName] = useState('');
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  const applicationType = dataStore.cache.query((q) => q.findRelatedRecord(project, 'type'));

  const attributes = attributesFor(project);
  const language: string = attributes.language;
  const isPublic: boolean = attributes.isPublic;
  const { description: type } = attributesFor(applicationType);
  const isSaveDisabled = disableSubmit || false;
  const currentName = attributes.name;
  const currentDescription = attributes.description;

  const onSubmit = useCallback(async () => {
    setDisableSubmit(true);
    try {
      const id = idFromRecordIdentity(dataStore, project);
      const name = !newName ? currentName : newName;
      const description = !newDescription ? currentDescription : newDescription;
      await updateAttributes({ name, description, language, isPublic });
      history.push(`/projects/${id}`);
    } catch (e) {
      toast.error(e);
      setDisableSubmit(false);
    }
  }, [
    newName,
    currentName,
    newDescription,
    currentDescription,
    language,
    isPublic,
    dataStore,
    updateAttributes,
    project,
    history,
  ]);
  const onCancel = useCallback(async () => {
    try {
      const id = idFromRecordIdentity(dataStore, project);
      history.push(`/projects/${id}`);
    } catch (e) {
      toast.error(e);
    }
  }, [project, dataStore, history]);
  const submitClasses = `
      ui button primary huge
      ${isSaveDisabled ? 'disabled' : ''}
    `;
  return (
    <div
      data-test-edit-project-form
      className='p-t-xl flex-column align-items-center justify-content-center'
    >
      <Card className='w-100'>
        <Card.Header className='flex-row justify-content-space-between'>
          <h1 className='ui header p-l-md p-r-md m-t-md m-b-md'>{t('project.editProject')}</h1>
        </Card.Header>
        <Card.Content className='p-lg'>
          <Form data-test-new-project-form>
            <h2 className='form-title'>{t('project.title')}</h2>
            <Form.Field className='flex-50'>
              <label className='required'>{t('project.projectName')}</label>
              <input
                required
                data-test-name
                value={newName || currentName}
                onChange={withValue(setNewName)}
              />
            </Form.Field>

            <Form.Field className='flex-50'>
              <label>{t('project.projectDescription')}</label>
              <textarea
                value={newDescription || currentDescription}
                onChange={withValue(setNewDescription)}
              />
            </Form.Field>
          </Form>
        </Card.Content>
      </Card>
      <div className='w-100 flex-row flex-grow justify-content-space-between'>
        <Link className='ui button basic huge' onClick={onCancel}>
          {t('common.cancel')}
        </Link>

        <button data-test-save className={submitClasses} onClick={onSubmit}>
          {t('common.save')}
        </button>
      </div>
    </div>
  );
}
