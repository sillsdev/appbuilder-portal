import * as React from 'react';
import { attributesFor } from 'react-orbitjs';
import { Input } from 'semantic-ui-react';

import Details from './details';
import Products from './products';
import Owners from './owners';
import Authors from './authors';
import Reviewers from './reviewers';
import Settings from './settings';

import { useTranslations } from '~/lib/i18n';

export default ({ project }) => {
  const { workflowProjectUrl } = attributesFor(project);
  const { t } = useTranslations();

  return (
    <div className='flex-lg p-b-xxl-lg'>
      <div className='flex-grow p-r-lg-lg'>
        <Details project={project} />
        <Products project={project} />
        <Settings project={project} />
      </div>
      <div className='thin-border w-50-lg m-t-lg-xs-only m-t-lg-sm-only'>
        {workflowProjectUrl && (
          <div data-input-copy-field className='m-b-md thin-bottom-border bg-lightest-gray p-md'>
            <h4 className='fs-11 m-b-sm'>{t('project.side.repositoryLocation')}</h4>
            <Input
              className='p-l-sm p-r-sm w-100'
              readOnly={true}
              defaultValue={workflowProjectUrl}
            />
          </div>
        )}
        <Owners project={project} />
        <Authors project={project} />
        <Reviewers project={project} />
      </div>
    </div>
  );
};
