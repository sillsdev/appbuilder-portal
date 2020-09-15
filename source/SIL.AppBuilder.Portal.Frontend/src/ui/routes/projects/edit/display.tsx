import React, { useState, useCallback } from 'react';
import { Card, Form, Checkbox } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { ProjectResource, attributesFor, idFromRecordIdentity } from '@data';

import { useDataActions } from '@data/containers/resources/project/with-data-actions';
import { useTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';

import { useRouter } from '~/lib/hooks';

import { withValue } from '~/lib/dom';

import { isEmpty } from '@lib/collection';
import LocaleInput from '@ui/components/inputs/locale-input';

interface IProps {
  project: ProjectResource;
}

export default function Details({ project }: IProps) {
  const { t } = useTranslations();
  const { history } = useRouter();
  const { updateAttributes } = useDataActions(project);
  const attributes = attributesFor(project);
  const currentName = attributes.name;
  const currentDescription = attributes.description;
  const currentLanguage: string = attributes.language;

  const [name, setName] = useState(currentName);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [description, setDescription] = useState(currentDescription);
  const [language, setLanguage] = useState(currentLanguage);

  const isPublic: boolean = attributes.isPublic;

  const areAllRequiredFieldsPresent = useCallback(() => {
    return !isEmpty(name) && !isEmpty(language);
  }, [language, name]);

  const isSaveDisabled = disableSubmit || !areAllRequiredFieldsPresent();
  const id = idFromRecordIdentity(project as any);
  const onSubmit = useCallback(async () => {
    setDisableSubmit(true);
    try {
      await updateAttributes({ name, description, language, isPublic });
      history.push(`/projects/${id}`);
    } catch (e) {
      toast.error(e);
      setDisableSubmit(false);
    }
  }, [name, description, language, isPublic, updateAttributes, history, id]);
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
          <Form data-test-edit-project-form>
            <h2 className='form-title'>{t('project.title')}</h2>
            <div className='grid-container'>
              <Form.Field className='flex-50'>
                <label className='required'>{t('project.projectName')}</label>
                <input required data-test-name value={name} onChange={withValue(setName)} />
              </Form.Field>
              <Form.Field className='flex-50'>
                <label className='required'>{t('project.languageCode')}</label>
                <LocaleInput
                  data-test-language
                  value={language}
                  onChange={withValue(setLanguage)}
                />
              </Form.Field>
            </div>
            <Form.Field className='flex-50'>
              <label>{t('project.projectDescription')}</label>
              <textarea
                data-test-description
                value={description}
                onChange={withValue(setDescription)}
              />
            </Form.Field>
          </Form>
        </Card.Content>
      </Card>
      <div className='w-100 flex-row flex-grow justify-content-space-between'>
        <Link data-test-cancel className='ui button basic huge' to={`/projects/${id}`}>
          {t('common.cancel')}
        </Link>

        <button data-test-save className={submitClasses} onClick={onSubmit}>
          {t('common.save')}
        </button>
      </div>
    </div>
  );
}
