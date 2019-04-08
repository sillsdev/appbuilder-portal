import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import TimezoneLabel from '@ui/components/labels/timezone';

import { attributesFor } from '@data';

import { useOrbit } from 'react-orbitjs';

import { useCurrentUser } from '~/data/containers/with-current-user';

export default ({ project: { id }, t, toggleArchive, claimOwnership }) => {
  const {
    dataStore,
    subscriptions: { project },
  } = useOrbit({
    project: (q) => q.findRecord({ type: 'project', id }),
  });

  const { name, dateCreated, dateArchived, isPublic } = attributesFor(project);
  const { currentUser } = useCurrentUser();

  const toggleText = !dateArchived
    ? t('project.dropdown.archive')
    : t('project.dropdown.reactivate');

  const visibility = isPublic ? t('project.public') : t('project.private');

  const owner = dataStore.cache.query((q) => q.findRelatedRecord(project, 'owner'));
  const isOwner = owner.id === currentUser.id;

  return (
    <div className='page-heading page-heading-border-sm'>
      <div className='flex justify-content-space-around'>
        <div className='flex-grow'>
          <h1 data-test-project-name className='fs-24 m-b-sm'>
            {name}
          </h1>
          <div>
            <span data-test-project-visibility-label>{visibility}</span>
            <span className='font-normal m-l-md m-r-md'>.</span>
            <span className='font-normal'>{t('project.createdOn')} </span>
            <TimezoneLabel dateTime={dateCreated} />
          </div>
        </div>
        <div className='flex-shrink'>
          <Dropdown pointing='top right' icon={null} trigger={<MoreVerticalIcon />}>
            <Dropdown.Menu>
              <Dropdown.Item data-test-archive text={toggleText} onClick={toggleArchive} />
              {!isOwner && (
                <Dropdown.Item
                  data-test-claim-ownership
                  text={t('project.claimOwnership')}
                  onClick={claimOwnership}
                />
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};
