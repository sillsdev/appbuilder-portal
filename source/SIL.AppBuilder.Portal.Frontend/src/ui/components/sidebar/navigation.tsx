import * as React from 'react';
import { Menu, Icon, Image } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { getCurrentOrganizationId } from '@lib/current-organization';

class Navigation extends React.Component<i18nProps> {
  render() {
    const currentOrganizationId = getCurrentOrganizationId();
    const hasSelectedOrg = currentOrganizationId && currentOrganizationId.length > 0;

    const { t } = this.props;

    return (
      <Menu className='m-t-none no-borders' pointing secondary vertical>
        <Menu.Item
          name={t('sidebar.myTasks')}
          as={NavLink}
          to='/tasks'
          activeClassName='active' />

        <Menu.Item
          name={t('sidebar.ourProjects')}
          as={NavLink}
          to='/our-projects'
          activeClassName='active' />


        <Menu.Item
          name={t('sidebar.users')}
          as={NavLink}
          to='/users'
          activeClassName='active' />

        { hasSelectedOrg && (
          <Menu.Item
            name={t('sidebar.organizationSettings')}
            as={NavLink}
            to={`/organizations/${currentOrganizationId}/settings`}
            activeClassName='active' />
        ) }

        <hr />

        <Menu.Item
          name={t('sidebar.projectDirectory')}
          as={NavLink}
          to='directory'
          className='project-directory-item'
          activeClassName='active' />

        <hr />

        <Menu.Item
          name={t('sidebar.addProject')}
          as={NavLink}
          to='add-projects'
          activeClassName='active' />
      </Menu>
    );
  }
}

export default compose(
  translate('translations')
)(Navigation);
