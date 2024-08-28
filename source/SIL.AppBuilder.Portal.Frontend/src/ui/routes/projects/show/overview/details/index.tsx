import * as React from 'react';
import { useOrbit } from 'react-orbitjs';
import { ProjectResource, attributesFor } from '@data';
import { useTranslations } from '@lib/i18n';

interface IProps {
  project: ProjectResource;
}

export default function Details({ project }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const applicationType = dataStore.cache.query((q) => q.findRelatedRecord(project, 'type'));

  const { language, description } = attributesFor(project);
  const { description: type } = attributesFor(applicationType);

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

      <div className='p-t-lg p-b-lg flex-grow'>
        <h3 className='fs-11'>{t('project.projectDescription')}</h3>
        <p data-test-project-detail-description className='p-b-sm fs-16'>
          {description}
        </p>
      </div>
    </div>
  );
}
