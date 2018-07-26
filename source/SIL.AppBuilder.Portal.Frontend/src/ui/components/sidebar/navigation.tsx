import * as React from 'react';
import { Menu, Icon, Image } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import { getCurrentOrganizationId } from '@lib/current-organization';

export default class extends React.Component {
  render() {
    const currentOrganizationId = getCurrentOrganizationId();
    const hasSelectedOrg = currentOrganizationId && currentOrganizationId.length > 0;

    return (
      <Menu className='m-t-none no-borders' pointing secondary vertical>
        <Menu.Item
          name='My tasks'
          as={NavLink}
          to='/tasks'
          activeClassName='active' />

        <Menu.Item
          name='Our Projects'
          as={NavLink}
          to='/our-projects'
          activeClassName='active' />


        <Menu.Item
          name='Users'
          as={NavLink}
          to='/our-projects'
          activeClassName='active' />

        { hasSelectedOrg && (
          <Menu.Item
            name='Organization Settings'
            as={NavLink}
            to={`/organizations/${currentOrganizationId}/settings`}
            activeClassName='active' />
        ) }

        <hr />

        <Menu.Item
          name='Project Directory'
          as={NavLink}
          to='projects'
          className='project-directory-item'
          activeClassName='active' />

        <hr />

        <Menu.Item
          name='Add Project'
          as={NavLink}
          to='add-projects'
          activeClassName='active' />
      </Menu>
    );
  }
}
