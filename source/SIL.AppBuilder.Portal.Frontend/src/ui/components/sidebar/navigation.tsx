import * as React from 'react';
import { compose } from 'recompose';
import { Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { ROLE } from '@data/models/role';
import { RequireRole } from '@ui/components/authorization';
import { withTranslations, i18nProps } from '@lib/i18n';
import { getCurrentOrganizationId } from '@lib/current-organization';

export interface IProps {
  closeSidebar: () => void;
}

interface MenuItem {
  name: string;
  to: string;
  onClick: (e) => void;
  exact?: boolean;
  className?: string;
  target?: string;
}

const MenuItem = ({ onClick, className, ...otherProps }: MenuItem) => {
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

class Navigation extends React.Component<IProps & i18nProps> {
  render() {
    const currentOrganizationId = getCurrentOrganizationId();
    const hasSelectedOrg = currentOrganizationId && currentOrganizationId.length > 0;
    const allOrgsSelected = '' === currentOrganizationId;

    const { t, closeSidebar } = this.props;

    return (
      <Menu className='m-t-none no-borders' pointing secondary vertical>
        <MenuItem name={t('sidebar.myTasks')} to='/tasks' onClick={closeSidebar} />

        <MenuItem name={t('sidebar.myProjects')} to='/projects/own' exact onClick={closeSidebar} />

        <MenuItem
          name={t('sidebar.organizationProjects')}
          to='/projects/organization'
          exact
          onClick={closeSidebar}
        />

        <RequireRole roleName={ROLE.OrganizationAdmin}>
          <MenuItem name={t('sidebar.users')} to='/users' onClick={closeSidebar} />
        </RequireRole>

        {hasSelectedOrg && (
          <RequireRole roleName={ROLE.OrganizationAdmin}>
            <MenuItem
              name={t('sidebar.organizationSettings')}
              to={`/organizations/${currentOrganizationId}/settings`}
              onClick={closeSidebar}
            />
          </RequireRole>
        )}

        <RequireRole roleName={ROLE.SuperAdmin}>
          <MenuItem
            name={t('sidebar.adminSettings')}
            to={`/admin/settings/organizations`}
            onClick={closeSidebar}
          />
        </RequireRole>

        <hr />

        <MenuItem name={t('sidebar.projectDirectory')} to='/directory' onClick={closeSidebar} />

        <hr />

        <MenuItem
          name={t('opensource')}
          to='/open-source'
          className='m-t-lg'
          target='_blank'
          onClick={closeSidebar}
        />
      </Menu>
    );
  }
}

export default compose(withTranslations)(Navigation);
