import * as React from 'react';
import { compose } from 'recompose';
import { Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { ROLE } from '@data/models/role';
import { RequireRole } from '@ui/components/authorization';
import { useTranslations } from '@lib/i18n';
import { getCurrentOrganizationId } from '@lib/current-organization';
import { useUserTasksForCurrentUser } from '~/data/containers/resources/user-task/list';

export interface IProps {
  closeSidebar: () => void;
}

const MenuItem = ({ onClick, className, ...otherProps }: any) => {
  return (
    <>
      <Menu.Item
        as={NavLink}
        activeClassName='active'
        className={`${className} d-xs-none d-sm-none d-md-none d-lg-block d-xl-block`}
        {...otherProps}
      />
      <Menu.Item
        as={NavLink}
        activeClassName='active'
        onClick={onClick}
        className={`${className} d-xs-block d-sm-block d-md-block d-lg-none d-xl-none`}
        {...otherProps}
      />
    </>
  );
};

export default function Navigation({ closeSidebar }: IProps) {
  const { t } = useTranslations();
  const { userTasks } = useUserTasksForCurrentUser();
  const currentOrganizationId = getCurrentOrganizationId();
  const hasSelectedOrg = currentOrganizationId && currentOrganizationId.length > 0;
  const allOrgsSelected = '' === currentOrganizationId;

  return (
    <Menu className='m-t-none no-borders' pointing secondary vertical>
      <MenuItem content={t('sidebar.myTasks', { count: userTasks.length })} to='/tasks' onClick={closeSidebar} />

      <MenuItem content={t('sidebar.myProjects')} to='/projects/own' exact onClick={closeSidebar} />

      <MenuItem
        content={t('sidebar.organizationProjects')}
        to='/projects/organization'
        exact
        onClick={closeSidebar}
      />

      <RequireRole roleName={ROLE.OrganizationAdmin}>
        <MenuItem content={t('sidebar.users')} to='/users' onClick={closeSidebar} />
      </RequireRole>

      {hasSelectedOrg && (
        <RequireRole roleName={ROLE.OrganizationAdmin}>
          <MenuItem
            content={t('sidebar.organizationSettings')}
            to={`/organizations/${currentOrganizationId}/settings`}
            onClick={closeSidebar}
          />
        </RequireRole>
      )}

      <RequireRole roleName={ROLE.SuperAdmin}>
        <MenuItem
          content={t('sidebar.adminSettings')}
          to={`/admin/settings/organizations`}
          onClick={closeSidebar}
        />
      </RequireRole>

      <hr />

      <MenuItem content={t('sidebar.projectDirectory')} to='/directory' onClick={closeSidebar} />

      <hr />

      <MenuItem
        content={t('opensource')}
        to='/open-source'
        className='m-t-lg'
        target='_blank'
        onClick={closeSidebar}
      />
    </Menu>
  );
}