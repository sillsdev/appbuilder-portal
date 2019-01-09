import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';

import TimezoneLabel from '@ui/components/labels/timezone';

import { attributesFor } from '@data';

export default ({ project, t, toggleArchive }) => {
  const { name, dateCreated, dateArchived, isPublic } = attributesFor(project);

  const toggleText = !dateArchived ?
    t('project.dropdown.archive') :
    t('project.dropdown.reactivate');

  const visibility = isPublic ?
    t('project.public') :
    t('project.private');

  return (
    <div className='page-heading page-heading-border-sm'>
      <div className='flex justify-content-space-around'>
        <div className='flex-grow'>
          <h1 data-test-project-name className='fs-24 m-b-sm'>
            {name}
          </h1>
          <div>
            <span data-test-project-visibility-label>
              {visibility}
            </span>
            <span className='font-normal m-l-md m-r-md'>.</span>
            <span className='font-normal'>{t('project.createdOn')} </span>
            <TimezoneLabel dateTime={dateCreated} />
          </div>
        </div>
        <div className='flex-shrink'>
          <Dropdown
            pointing='top right'
            icon={null}
            trigger={
              <MoreVerticalIcon />
            }
          >
            <Dropdown.Menu>
              <Dropdown.Item
                data-test-archive
                text={toggleText}
                onClick={toggleArchive}
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}