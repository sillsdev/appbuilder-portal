import * as React from 'react';
import { Menu, Icon, Image } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { getCurrentOrganizationId } from '@lib/current-organization';

const MenuItem = ({name, to, onClick}) => {

  return (
    <>
    <Menu.Item
      name={name}
      as={NavLink}
      to={to}
      activeClassName='active'
        className='d-xs-none d-sm-none d-md-none d-lg-block d-xl-block' />
    <Menu.Item
      name={name}
      as={NavLink}
      to={to}
      activeClassName='active'
      onClick={onClick}
      className='d-xs-block d-sm-block d-md-block d-lg-none d-xl-none' />
    </>
  );
};

class Navigation extends React.Component<i18nProps> {

  render() {
    const currentOrganizationId = getCurrentOrganizationId();
    const hasSelectedOrg = currentOrganizationId && currentOrganizationId.length > 0;

    const { t, closeSidebar } = this.props;

    return (
      <Menu className='m-t-none no-borders' pointing secondary vertical>

        <MenuItem
          name={t('sidebar.myTasks')}
          to='/tasks'
          onClick={closeSidebar}
        />

        <MenuItem
          name={t('sidebar.ourProjects')}
          to='/our-projects'
          onClick={closeSidebar}
        />

        <MenuItem
          name={t('sidebar.users')}
          to='/users'
          onClick={closeSidebar}
        />

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

        <MenuItem
          name={t('sidebar.addProject')}
          to='add-projects'
          onClick={closeSidebar} />
      </Menu>
    );
  }
}

export default compose(
  translate('translations')
)(Navigation);
