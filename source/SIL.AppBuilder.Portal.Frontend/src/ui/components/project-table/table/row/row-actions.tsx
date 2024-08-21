import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { useOrbit } from 'react-orbitjs';
import { useCurrentUser } from '@data/containers/with-current-user';
import { useDataActions } from '@data/containers/resources/project/with-data-actions';
import { retrieveRelation } from '@data/containers/with-relationship';
import { ROLE } from '@data/models/role';
import { RequireRole } from '@ui/components/authorization';
import { attributesFor, ProjectResource } from '@data';
import { useTranslations } from '@lib/i18n';

interface IProps {
  project: ProjectResource;
}

export default function RowActions({ project }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();
  const { claimOwnership, toggleArchiveProject } = useDataActions(project);

  const owner = dataStore.cache.query((q) => q.findRelatedRecord(project, 'owner'));
  const group = dataStore.cache.query((q) => q.findRelatedRecord(project, 'group'));
  const groups = retrieveRelation(dataStore, [currentUser, 'groupMemberships', 'group']);
  const groupIds = (groups || []).map((o) => o && o.id);

  const { dateArchived } = attributesFor(project);

  const dropdownItemText = !dateArchived
    ? t('project.dropdown.archive')
    : t('project.dropdown.reactivate');

  const isCurrentUserOwner = currentUser.id === owner.id;
  const isCurrentUserInGroup = groupIds.includes(group.id);

  return (
    <Dropdown
      className='project-actions'
      pointing='top right'
      data-test-row-actions
      icon={null}
      trigger={<MoreVerticalIcon />}
    >
      <Dropdown.Menu>
        {/* <Dropdown.Item text={t('project.dropdown.build')} /> */}
        <RequireRole
          {...{
            roleName: ROLE.OrganizationAdmin,
            owner,
            overrideIf({ owner, currentUser }) {
              return owner.id === currentUser.id;
            },
          }}
        >
          <Dropdown.Item text={dropdownItemText} onClick={toggleArchiveProject} />
        </RequireRole>
        {!isCurrentUserOwner && isCurrentUserInGroup && (
          <Dropdown.Item text={t('project.claimOwnership')} onClick={claimOwnership} />
        )}{' '}
      </Dropdown.Menu>
    </Dropdown>
  );
}
