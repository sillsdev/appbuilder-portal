import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';
import { isEmpty } from '@lib/collection';
import ApplicationTypeSelect from '@ui/components/inputs/application-type-select';
import GroupSelect from '@ui/components/inputs/group-select';
import { useCurrentUser } from '@data/containers/with-current-user';
import { useOrbit } from 'react-orbitjs/dist';

import { useRouter } from '~/lib/hooks';
import { withValue } from '~/lib/dom';

export default function Display({ currentOrganizationId, currentOrganization, create }) {
  const { history } = useRouter();
  const { dataStore } = useOrbit();
  const { t } = useTranslations();
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [groupId, setGroupId] = useState();
  const [jsonfile, setJsonfile] = useState(null);
  const [typeId, setTypeId] = useState();
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    setGroupId(undefined);
  }, [currentOrganizationId]);

  const areAllRequiredFieldsPresent = useCallback(() => {
    return !isEmpty(jsonfile) && !isEmpty(groupId) && !isEmpty(typeId);
  }, [jsonfile, groupId, typeId]);

  const isSaveDisabled = disableSubmit || !areAllRequiredFieldsPresent();

  const onSubmit = useCallback(async () => {
    setDisableSubmit(true);

    try {
      const fileToString = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => resolve(JSON.stringify(reader.result));
          reader.onerror = (error) => reject(error);
        });

      const importData = await fileToString(jsonfile);
      await create({ importData }, groupId, typeId);
      toast.success(t('projectImport.createSuccess'));
      history.push(`/`);
    } catch (e) {
      toast.error(e);
      setDisableSubmit(false);
    }
  }, [create, jsonfile, groupId, currentUser, typeId, dataStore, history]);

  const submitClasses = `
      ui button primary huge
      ${isSaveDisabled ? 'disabled' : ''}
    `;

  return (
    <div
      data-test-import-projects-form
      className='p-t-xl flex-column align-items-center justify-content-center'
    >
      <Card className='w-100'>
        <Card.Header className='flex-row justify-content-space-between'>
          <h1 className='ui header p-l-md p-r-md m-t-md m-b-md'>{t('project.importProjects')}</h1>
        </Card.Header>
        <Card.Header className='flex-row justify-content-space-between'>
          <a
            className='item p-l-md p-r-md m-b-md'
            target='_blank'
            rel='noopener noreferrer'
            href='https://sil-prd-aps-resources.s3.amazonaws.com/Project+Import.pdf'
          >
            {t('project.importProjectsHelp')}
          </a>
        </Card.Header>

        <Card.Content className='p-lg'>
          <Form data-test-import-projects-form>
            <div className='grid-container'>
              <Form.Field className='flex-50'>
                <label>{t('project.projectGroup')}</label>
                <GroupSelect
                  scopeToCurrentUser={true}
                  scopeToOrganization={currentOrganization}
                  selected={groupId}
                  onChange={withValue(setGroupId)}
                />
              </Form.Field>

              <Form.Field className='flex-50 m-b-md'>
                <label>{t('project.type')}</label>
                <ApplicationTypeSelect selected={typeId} onChange={withValue(setTypeId)} />
              </Form.Field>

              <Form.Field className='flex-50'>
                <label>{t('projectImport.importFile')}</label>
                <input
                  data-test-import-input-file
                  type='file'
                  name='file'
                  accept='application/json'
                  onChange={(e) => {
                    setJsonfile(e.target.files[0]);
                  }}
                />
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
