import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Checkbox } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { useTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';
import { isEmpty } from '@lib/collection';
import ApplicationTypeSelect from '@ui/components/inputs/application-type-select';
import GroupSelect from '@ui/components/inputs/group-select';
import LocaleInput from '@ui/components/inputs/locale-input';

import { useRouter, useToggle } from '~/lib/hooks';

import { withValue } from '~/lib/dom';
import { idFromRecordIdentity, useOrbit } from 'react-orbitjs/dist';

export default function Display({ currentOrganizationId, currentOrganization, create }) {
  const { history } = useRouter();
  const { dataStore } = useOrbit();
  const { t } = useTranslations();
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [isPublic, setIsPublic] = useToggle(true);
  const [groupId, setGroupId] = useState();
  const [language, setLanguage] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState();
  const [name, setName] = useState('');

  useEffect(() => {
    setGroupId(undefined);
  }, [currentOrganizationId]);

  const areAllRequiredFieldsPresent = useCallback(() => {
    return !isEmpty(name) && !isEmpty(groupId) && !isEmpty(language) && !isEmpty(typeId);
  }, [name, groupId, language, typeId]);

  const isSaveDisabled = disableSubmit || !areAllRequiredFieldsPresent();

  const onSubmit = useCallback(async () => {
    setDisableSubmit(true);

    try {
      const project = await create({ name, language, isPublic, description }, groupId, typeId);
      const id = idFromRecordIdentity(dataStore, project);
      history.push(`/projects/${id}`);
    } catch (e) {
      toast.error(e);
    }

    setDisableSubmit(false);
  }, [name, language, isPublic, description, groupId, typeId]);

  const submitClasses = `
      ui button primary huge
      ${isSaveDisabled ? 'disabled' : ''}
    `;

  return (
    <div
      data-test-new-project-form
      className='p-t-xl flex-column align-items-center justify-content-center'
    >
      <Card className='w-100'>
        <Card.Header className='flex-row justify-content-space-between'>
          <h1 className='ui header p-l-md p-r-md m-t-md m-b-md'>{t('project.newProject')}</h1>
        </Card.Header>

        <Card.Content className='p-lg'>
          <Form data-test-new-project-form>
            <h2 className='form-title'>{t('project.title')}</h2>

            <div className='grid-container'>
              <Form.Field className='flex-50'>
                <label className='required'>{t('project.projectName')}</label>
                <input required data-test-name value={name || ''} onChange={withValue(setName)} />
              </Form.Field>

              <Form.Field className='flex-50'>
                <label>{t('project.projectGroup')}</label>
                <GroupSelect
                  scopeToCurrentUser={true}
                  scopeToOrganization={currentOrganization}
                  selected={groupId}
                  onChange={withValue(setGroupId)}
                />
              </Form.Field>

              <Form.Field className='flex-50'>
                <label className='required'>{t('project.languageCode')}</label>
                <LocaleInput value={language} onChange={withValue(setLanguage)} />
              </Form.Field>

              <Form.Field className='flex-50 m-b-md'>
                <label>{t('project.type')}</label>
                <ApplicationTypeSelect selected={typeId} onChange={withValue(setTypeId)} />
              </Form.Field>

              <Form.Field className='flex-50'>
                <label>{t('project.projectDescription')}</label>
                <textarea value={description || ''} onChange={withValue(setDescription)} />
              </Form.Field>

              <Form.Field className='flex-50 m-t-md p-t-sm'>
                <div className='flex-row'>
                  <div className='toggle-selector flex-row flex-grow justify-content-space-between'>
                    <span className='bold'>{t('project.visibilityLabel')}</span>
                    <Checkbox
                      toggle
                      data-test-visibility
                      checked={isPublic}
                      onClick={setIsPublic}
                    />
                  </div>
                </div>

                <div className='flex-row m-t-md'>
                  <p>{t('project.visibilityDescription')}</p>
                </div>
              </Form.Field>
            </div>
          </Form>
        </Card.Content>
      </Card>

      <div className='w-100 flex-row flex-grow justify-content-space-between'>
        <Link className='ui button basic huge' to='/'>
          {t('common.cancel')}
        </Link>

        <button data-test-save className={submitClasses} onClick={onSubmit}>
          {t('common.save')}
        </button>
      </div>
    </div>
  );
}
