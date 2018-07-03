import * as React from 'react';

import './sidebar.scss';
import { Menu, Icon, Image } from 'semantic-ui-react';

export interface IProps {
  isSidebarVisible: boolean;
  activeMenu: string;
  toggleSidebar: () => void;
  setActiveMenu: (string) => void;
}

class Sidebar extends React.Component<IProps> {

  render() {
    const { toggleSidebar, isSidebarVisible } = this.props;
    const sidebarDisplay = isSidebarVisible ? 'block' : 'none';

    const { setActiveMenu, activeMenu } = this.props;

    return (
      <div className='sidebar' style={{ display: sidebarDisplay }}>

        <div className='sidebar-title'>
          <Image className="logo" src='data:image/svg+xml;base64,PHN2ZyB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlua3NjYXBlOnZlcnNpb249IjAuOTEgcjEzNzI1IiBoZWlnaHQ9Ijk1LjE0bW0iIHdpZHRoPSI4NC43N21tIiB2ZXJzaW9uPSIxLjEiIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgc29kaXBvZGk6ZG9jbmFtZT0iU0lMIEludGVybmF0aW9uYWwgbG9nbyAoMjAxNCkuc3ZnIiB2aWV3Qm94PSIwIDAgMzAwLjM0MjU3IDMzNy4xMDQyNyIgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIj48c29kaXBvZGk6bmFtZWR2aWV3IGJvcmRlcmNvbG9yPSIjNjY2NjY2IiBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIiBpbmtzY2FwZTp3aW5kb3cteT0iLTgiIGZpdC1tYXJnaW4tbGVmdD0iMCIgcGFnZWNvbG9yPSIjZmZmZmZmIiBpbmtzY2FwZTp6b29tPSIzLjk1OTc5OCIgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIgaW5rc2NhcGU6d2luZG93LXg9Ii04IiBzaG93Z3JpZD0iZmFsc2UiIGJvcmRlcm9wYWNpdHk9IjEuMCIgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iZzYiIGlua3NjYXBlOmN4PSI3Ny41ODIzNTYiIGlua3NjYXBlOmN5PSIyOTIuNDA5ODciIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiIGZpdC1tYXJnaW4tcmlnaHQ9IjAuMSIgZml0LW1hcmdpbi1ib3R0b209IjAiIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjcxNSIgZml0LW1hcmdpbi10b3A9IjAiIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTM2NiIgaW5rc2NhcGU6ZG9jdW1lbnQtdW5pdHM9InB4Ii8+PGcgaW5rc2NhcGU6bGFiZWw9IkxheWVyIDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zODcgLTExOTUpIiBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIj48cmVjdCBoZWlnaHQ9IjMzNy4xIiB3aWR0aD0iMzAwIiB5PSIxMTk1IiB4PSIzODciIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJtMzg3IDE0OTB2LTQyLjEyaDQyLjgyYzQ2LjQgMCA0NS45OCAwLjAxMyA1Mi4xMi0xLjUzNSAxMC44OS0yLjc0MyAxOS4yNC04LjY4NiAyNC4zLTE3LjI5IDQuOTQ5LTguNDIyIDYuNDQ5LTE5LjcyIDMuOTM1LTI5LjY0LTIuNzU2LTEwLjg2LTEwLjA0LTE5LjczLTIyLjQ4LTI3LjM1LTEzLjM0LTguMTc5LTE2LjcyLTExLjM2LTE3Ljg1LTE2Ljc5LTAuNzU2MS01LjYzNyAwLjM5NjQtMTAuMjIgNS4wMTgtMTMuMjYgNS44NjQtMy43NDggMTcuNDQtMy40OTcgMjUuMzggMC41NTEyIDAuNzc1IDAuMzk1NCAxLjM3OCAwLjU2NjYgMS40MjkgMC4yOTc1bDQuNTEtMjMuNzJjMC4xMjI2LTAuNjQ0NS02LjgyMS0yLjQ3Ni0xMS45NC0zLjUzNC0xNi40Mi0zLjAwMi0zMi43Mi0xLjMzNC00My45NCA5LjY0NC00LjE2NSA0LjE0Mi02LjQzOSA3Ljc1Mi04LjMzNyAxMy4yMy0yLjA5MyA3LjUxOS0zLjA2NyAxNS40OC0xLjI2MiAyMi4wMyAxLjk0NyA3LjAxIDUuNjYgMTMuMTIgMTEuNDIgMTguNzggNy41NzcgNy4zNDUgMTMuNTIgOS4yOTEgMjEuNTggMTYuMDIgNC43NzggNC4wNjMgNi45MjMgOC4wNzcgNy4yOTIgMTMuNjUgMC40NjM5IDcuMDAzLTIuOTUzIDExLTExIDEyLjg3LTIuNDkxIDAuNTc4NS0zLjExMiAwLjU4ODQtNDIuNzcgMC42Nzk5bC00MC4yNCAwLjA5M3YtMTEzLjgtMTEzLjhoMTUwIDE1MHYxMTMuOCAxMTMuNmgtNzQuODhjLTAuMjk2Mi0zNSAwLjI5NjItNjkuOTMgMC0xMDQuOWgtMjYuNzN2MTMwLjhoMTAxLjZ2NDEuOTkgNDEuODRoLTE1MC0xNTB6bTE3MS4yLTQyLjJjMC4xNzY2LTQ1Ljg2IDAuMDU3Mi04MS0wLjAwMS0xMzAuM2gtMjUuNTZ2MTMwLjhoMjUuNTZ6IiBzb2RpcG9kaTpub2RldHlwZXM9ImNjc3Nzc3NjY3Nzc2NjY2NjY3Nzc2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjIiBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiBmaWxsPSIjMDA2OGE2Ii8+PC9nPjwvc3ZnPg=='/>
          <button className='close' onClick={toggleSidebar}>
            <Icon name='close' size='large' />
          </button>
        </div>

        <Menu pointing secondary vertical>
          <Menu.Item 
            name='My tasks' 
            active={activeMenu === 'tasks'} 
            onClick={e => setActiveMenu('tasks')} />
          <Menu.Item
            name='Our Projects'
            active={activeMenu === 'projects'}
            onClick={e => setActiveMenu('projects')} />
          <Menu.Item
            className='project-directory-item'
            name='Project Directory'
            active={activeMenu === 'directory'}
            onClick={e => setActiveMenu('directory')} />
          <Menu.Item
            name='Add Project'
            active={activeMenu === 'addProject'}
            onClick={e => setActiveMenu('addProject')} />                                    
        </Menu>
      </div>
    );
  }
}

export default Sidebar;
