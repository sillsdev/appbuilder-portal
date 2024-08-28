import * as React from 'react';
import { ProjectResource, attributesFor } from '@data';
import { useTranslations } from '@lib/i18n';
import TimezoneLabel from '@ui/components/labels/timezone';

interface IProps {
  project: ProjectResource;
}

export default function Header({ project }: IProps) {
  const { t } = useTranslations();
  const { name, dateCreated, language } = attributesFor(project);

  return (
    <div className='page-heading'>
      <div className='flex justify-content-space-around'>
        <div className='flex-grow'>
          <h1 data-test-project-name className='fs-24 m-b-sm'>
            {name} ({language})
          </h1>
          <div>
            <span className='font-normal'>{t('project.createdOn')} </span>
            <TimezoneLabel dateTime={dateCreated} />
          </div>
        </div>
      </div>
    </div>
  );
}
