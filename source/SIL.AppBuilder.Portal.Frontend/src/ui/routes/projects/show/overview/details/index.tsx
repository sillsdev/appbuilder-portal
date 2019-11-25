import * as React from 'react';
import { useOrbit } from 'react-orbitjs';

import { ProjectResource, attributesFor } from '@data';

import { useDataActions } from '@data/containers/resources/project/with-data-actions';
import { useTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';
import AutoSavingInput from '@ui/components/inputs/auto-saving-input';

interface IProps {
  project: ProjectResource;
}

export default function Details({ project }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const { updateAttribute } = useDataActions(project);
  const applicationType = dataStore.cache.query((q) => q.findRelatedRecord(project, 'type'));

  const { language, description } = attributesFor(project);
  const { description: type } = attributesFor(applicationType);

  const updateDescription = async (value: string) => {
    try {
      await updateAttribute('description', value);

      toast.success(t('common.updated'));
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <div data-test-project-details className='thin-bottom-border m-b-lg'>
      <h3 className='fs-21'>{t('project.details.title')}</h3>
      <div className='flex justify-content-space-around'>
        <div className='flex-grow'>
          <h4 className='fs-11'>{t('project.details.language')}</h4>
          <p data-test-project-detail-language className='m-r-lg p-b-sm fs-16 thin-bottom-border'>
            {language}
          </p>
        </div>
        <div className='flex-grow'>
          <h4 className='fs-11'>{t('project.details.type')}</h4>
          <p data-test-project-detail-type className='p-b-sm fs-16 thin-bottom-border'>
            {type}
          </p>
        </div>
      </div>
      <div className='p-t-lg p-b-lg fs-16'>
        <AutoSavingInput value={description} onChange={updateDescription} />
      </div>
    </div>
  );
}
