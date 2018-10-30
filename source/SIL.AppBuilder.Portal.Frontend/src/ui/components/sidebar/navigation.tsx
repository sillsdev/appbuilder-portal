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
}

const MenuItem = ({ name, to, onClick, exact, className }: MenuItem) => {

  return (
    <>
      <Menu.Item
        name={name}
        as={NavLink}
        to={to}
        exact
        activeClassName='active'
        className={`${className} d-xs-none d-sm-none d-md-none d-lg-block d-xl-block`}
      />
      <Menu.Item
        name={name}
        as={NavLink}
        to={to}
        activeClassName='active'
        onClick={onClick}
        exact
        className={`${className} d-xs-block d-sm-block d-md-block d-lg-none d-xl-none`}
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

        <MenuItem
          name={t('sidebar.myTasks')}
          to='/tasks'
          onClick={closeSidebar}
        />

        <MenuItem
          name={t('sidebar.myProjects')}
          to='/projects/own'
          exact
          onClick={closeSidebar}
        />

        <MenuItem
          name={t('sidebar.organizationProjects')}
          to='/projects/organization'
          exact
          onClick={closeSidebar}
        />

        <RequireRole roleName={ROLE.OrganizationAdmin}>
          <MenuItem
            name={t('sidebar.users')}
            to='/users'
            onClick={closeSidebar}
          />
        </RequireRole>

        { hasSelectedOrg && (
          <MenuItem
            name={t('sidebar.organizationSettings')}
            to={`/organizations/${currentOrganizationId}/settings`}
            onClick={closeSidebar} />
        ) }

        <hr />

        <MenuItem
          name={t('sidebar.projectDirectory')}
          to='/directory'
          onClick={closeSidebar} />

        <hr />

        { allOrgsSelected && (
          <Menu.Item
            className={'disabled'}
            to='/projects/new'>
            <span>{t('sidebar.addProject')}</span>
          </Menu.Item>
        )}

        { !allOrgsSelected && (
          <RequireRole roleName={ROLE.OrganizationAdmin}>
            <MenuItem
              name={t('sidebar.addProject')}
              to='/projects/new'
              onClick={closeSidebar} />
          </RequireRole>
        )}

        <hr />

        <MenuItem
          name={t('opensource')}
          to='/open-source'
          className='m-t-lg'
          onClick={closeSidebar} />
      </Menu>
    );
  }
}

export default compose(
  withTranslations
)(Navigation);
