import * as React from 'react';
import { useOrbit, attributesFor } from 'react-orbitjs';
import { ProjectResource } from '@data';
import { useDataActions } from '@data/containers/resources/project/with-data-actions';
import * as toast from '@lib/toast';
import { useTranslations } from '@lib/i18n';
import GroupSelect from '@ui/components/inputs/group-select';
import UserSelect from '@ui/components/inputs/user-select';

interface IProps {
  project: ProjectResource;
}

export default function SidebarOfOwners({ project }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const { updateGroup, updateOwner } = useDataActions(project);

  const group = dataStore.cache.query((q) => q.findRelatedRecord(project, 'group'));
  const organization = dataStore.cache.query((q) => q.findRelatedRecord(project, 'organization'));
  const owner = dataStore.cache.query((q) => q.findRelatedRecord(project, 'owner'));

  let _updateGroup = async (groupId) => {
    try {
      await updateGroup(groupId);
      toast.success(t('updated'));
    } catch (e) {
      toast.error(t('errors.generic', { errorMessage: e.message }));
    }
  };

  let _updateOwner = async (userId) => {
    try {
      await updateOwner(userId);
      toast.success(t('updated'));
    } catch (e) {
      toast.error(t('errors.generic', { errorMessage: e.message }));
    }
  };

  const groupId = group.id;
  const ownerId = owner.id;
  const { name: orgName } = attributesFor(organization);

  return (
    <div className='thin-bottom-border p-t-md p-b-sm p-l-md p-r-md'>
      <div className='m-b-md'>
        <h4 className='fs-11 m-b-sm'>{t('project.side.organization')}</h4>
        <div className='p-l-sm p-r-sm p-t-sm p-b-sm thin-bottom-border'>
          <span>{orgName}</span>
        </div>
      </div>
      <div className='m-b-md'>
        <h4 className='fs-11 m-b-sm'>{t('project.side.projectOwner')}</h4>
        <div className='flex justify-content-space-around'>
          <div className='flex-grow p-l-sm p-r-sm p-t-sm p-b-sm thin-bottom-border'>
            <UserSelect
              selected={ownerId}
              groupId={groupId}
              restrictToGroup={true}
              scopeToOrganization={organization}
              onChange={_updateOwner}
            />
          </div>
        </div>
      </div>
      <div className='m-b-md'>
        <h4 className='fs-11 m-b-sm'>{t('project.side.projectGroup')}</h4>
        <div className='flex-grow p-l-sm p-r-sm p-t-sm p-b-sm'>
          <GroupSelect
            data-test-group-select
            scopeToCurrentUser={true}
            scopeToOrganization={organization}
            selected={groupId}
            onChange={_updateGroup}
          />
        </div>
      </div>
    </div>
  );
}
