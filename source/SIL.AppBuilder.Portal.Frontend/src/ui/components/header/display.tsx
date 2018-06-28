import React, { Component } from 'react';
import { withRouter, RouteComponentProps  } from 'react-router';
import {
  Container, Menu, Button,
  Dropdown, Image, Icon
} from 'semantic-ui-react';

import './header.scss';

export interface Props {
  toggleSidebar: () => {}
}

class Header extends Component<Props & RouteComponentProps<{}>> {

  render() {
    return (
      <Menu data-test-header-menu className='menu-navbar'>
        <Container>
          <Menu.Item data-test-header-appname header onClick={(e) => {
            this.props.history.push('/');
          }}>
            SCRIPTORIA
      </Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item>
              <Button onClick={(e) => {
                this.props.toggleSidebar();
              }}>Open Sidebar</Button>
              <Button data-test-header-addproject>Add Project</Button>
            </Menu.Item>
            <Menu.Item className='notification-item'>
              <Dropdown 
                data-test-header-notification 
                className='notification-dropdown' 
                pointing='top right' 
                icon={null}
                trigger={
                  <span>
                    <Icon circular name='alarm' size='large' />
                  </span>
                } 
              >
                <Dropdown.Menu>
                  <Dropdown.Item text='notification 1' />
                  <Dropdown.Item text='notification 2' />
                  <Dropdown.Item text='notification 3' />
                  <Dropdown.Item text='notification 4' />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
            <Menu.Item>
              <Dropdown 
                data-test-header-avatar 
                className='avatar-dropdown' 
                pointing='top right' 
                icon={null}
                trigger={
                  <span>
                    <Image avatar src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDE5Ni42NTEgMTk2LjY1MSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTk2LjY1MSAxOTYuNjUxOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGc+Cgk8Zz4KCQk8cmVjdCB4PSI4My42MjgiIHk9IjE0Ni4zODYiIHN0eWxlPSJmaWxsOiNGRENDOUI7IiB3aWR0aD0iMjkuMzk1IiBoZWlnaHQ9IjMyLjkyMyIvPgoJCTxwYXRoIHN0eWxlPSJmaWxsOiNGQ0JDODU7IiBkPSJNODMuNjI4LDE1MC4yNjRjMCwwLDEyLjM2NSw3Ljg3NCwyOS4zOTUsNi4wNTF2LTkuOTI5SDgzLjYyOFYxNTAuMjY0eiIvPgoJCTxlbGxpcHNlIHN0eWxlPSJmaWxsOiNGQ0JDODU7IiBjeD0iNDEuMjQyIiBjeT0iOTUuMzM2IiByeD0iMTQuMzQzIiByeT0iMTYuMzY0Ii8+CgkJPGVsbGlwc2Ugc3R5bGU9ImZpbGw6I0ZDQkM4NTsiIGN4PSIxNTUuNDA5IiBjeT0iOTUuMzM2IiByeD0iMTQuMzQzIiByeT0iMTYuMzY0Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZEQ0M5QjsiIGQ9Ik0xNTUuMzUyLDY0LjA4YzAtMjQuMTA0LTE3LjYzNy00MS43NC01Ny4wMjYtNDEuNzRjLTM5LjM4OSwwLTU3LjAyNiwxNy42MzctNTcuMDI2LDQxLjc0ICAgIGMwLDI0LjEwNC00LjExNSw4Ny41OTcsNTcuMDI2LDg3LjU5N0MxNTkuNDY3LDE1MS42NzcsMTU1LjM1Miw4OC4xODUsMTU1LjM1Miw2NC4wOHoiLz4KCQk8Zz4KCQkJPGc+CgkJCQk8ZWxsaXBzZSBzdHlsZT0iZmlsbDojM0IyNTE5OyIgY3g9IjcwLjU1IiBjeT0iOTEuNDE4IiByeD0iNi4xNzMiIHJ5PSI2Ljc2MSIvPgoJCQkJPGNpcmNsZSBzdHlsZT0iZmlsbDojRkZGRkZGOyIgY3g9IjY3Ljg1OSIgY3k9Ijg4LjQzMyIgcj0iMS44NDYiLz4KCQkJPC9nPgoJCQk8cGF0aCBzdHlsZT0iZmlsbDojODY0NjFCOyIgZD0iTTYwLjY3NSw3NC42NjJjMi45MTksMS40Niw3LjYwNi00Ljk2LDE4LjMzNSwwLjYyNWMxLjk1NiwxLjAxOCwzLjEyMy04LjcwOC04LjM3Ny04LjcwOCAgICAgQzYwLjY3NSw2Ni41NzksNTguOTExLDczLjc4MSw2MC42NzUsNzQuNjYyeiIvPgoJCQk8Zz4KCQkJCTxlbGxpcHNlIHN0eWxlPSJmaWxsOiMzQjI1MTk7IiBjeD0iMTI2Ljg2NCIgY3k9IjkxLjQxOCIgcng9IjYuMTczIiByeT0iNi43NjEiLz4KCQkJCTxjaXJjbGUgc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGN4PSIxMjQuMTczIiBjeT0iODguNDMzIiByPSIxLjg0NiIvPgoJCQk8L2c+CgkJCTxwYXRoIHN0eWxlPSJmaWxsOiM4NjQ2MUI7IiBkPSJNMTM1Ljk3Nyw3NC42NjJjLTIuOTE5LDEuNDYtNy42MDYtNC45Ni0xOC4zMzUsMC42MjVjLTEuOTU2LDEuMDE4LTMuMTIzLTguNzA4LDguMzc4LTguNzA4ICAgICBDMTM1Ljk3Nyw2Ni41NzksMTM3Ljc0LDczLjc4MSwxMzUuOTc3LDc0LjY2MnoiLz4KCQk8L2c+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZDQkM4NTsiIGQ9Ik05OC4zMjYsMTE1LjE5OGMtNi4xLDAtOS43NzQtNC41NTctOS43NzQtMi4zNTJjMCwyLjIwNCwxLjc2NCw2LjM5Myw5Ljc3NCw2LjM5MyAgICBjOC4wMSwwLDkuNzc0LTQuMTg5LDkuNzc0LTYuMzkzQzEwOC4xLDExMC42NDIsMTA0LjQyNSwxMTUuMTk4LDk4LjMyNiwxMTUuMTk4eiIvPgoJCTxwYXRoIHN0eWxlPSJmaWxsOiNGQ0JDODU7IiBkPSJNOTguMzI2LDEzNS40NjljLTIuMTEsMC0zLjM4MS0xLjU3Ni0zLjM4MS0wLjgxM2MwLDAuNzYzLDAuNjEsMi4yMTIsMy4zODEsMi4yMTIgICAgYzIuNzcxLDAsMy4zOC0xLjQ0OSwzLjM4LTIuMjEyQzEwMS43MDYsMTMzLjg5MywxMDAuNDM1LDEzNS40NjksOTguMzI2LDEzNS40Njl6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0Y3OTQ1RTsiIGQ9Ik05OC4zMjYsMTI5Ljg1MmMtOS42NjgsMC0xNS40OTMtMy45MzctMTUuNDkzLTIuOTM5YzAsMC45OTcsMi43OTYsNC45MjQsMTUuNDkzLDQuOTI0ICAgIGMxMi42OTcsMCwxNS40OTMtMy45MjcsMTUuNDkzLTQuOTI0QzExMy44MTgsMTI1LjkxNCwxMDcuOTk0LDEyOS44NTIsOTguMzI2LDEyOS44NTJ6Ii8+Cgk8L2c+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRDU4RTY0OyIgZD0iTTk4LjMyNiwxNTkuNjEzdjM3LjAzOEgyNi44OThDMjYuODk4LDE4MS42Niw2NC41MjEsMTU5LjYxMyw5OC4zMjYsMTU5LjYxM3oiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNENThFNjQ7IiBkPSJNOTguMzI2LDE1OS42MTN2MzcuMDM4aDcxLjQyN0MxNjkuNzUzLDE4MS42NiwxMzIuMTI5LDE1OS42MTMsOTguMzI2LDE1OS42MTN6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojQkY4MDVBOyIgZD0iTTk4LjMyNiwxNTkuNjEzYy03LjE5LDAtMTQuNTUyLDEuMDA1LTIxLjY4OSwyLjcyMWMwLjA0OCwwLjA2Myw3LjkxNywxMC4yMTMsMjEuNjg5LDEwLjIxMyAgIGMxMi43NTQsMCwyMS4yMzMtOC42OTIsMjIuNDYyLTEwLjAzQzExMy40MSwxNjAuNjg2LDEwNS43NzUsMTU5LjYxMyw5OC4zMjYsMTU5LjYxM3oiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNGRENDOUI7IiBkPSJNODMuNjI4LDE2MC44OTVjMCwwLDQuMjk5LDUuMzMyLDE0LjY5Nyw1LjMzMmMxMC4zOTgsMCwxNC42OTgtNS4zMzIsMTQuNjk4LTUuMzMyICAgUzk3Ljc3NCwxNTUuMzQ0LDgzLjYyOCwxNjAuODk1eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6Izg2NDYxQjsiIGQ9Ik05OC4zMjUsMTM5LjExdjEzLjY2OWMtMzAuNzE3LDAtNDAuODU3LTE2LjM3OC00My44NjEtMjAuOTQzICAgYy0yLjIyNy0zLjM4NywxNC40NTIsMTEuOTA0LDI5LjE2NCwxMS45MDRDOTAuMDk1LDE0My43NCw4OS44MDEsMTM5LjExLDk4LjMyNSwxMzkuMTF6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojODY0NjFCOyIgZD0iTTk4LjMyNSwxMzkuMTF2MTMuNjY5YzMwLjcxOCwwLDQwLjg1OC0xNi4zNzgsNDMuODYxLTIwLjk0MyAgIGMyLjIyNy0zLjM4Ny0xNC40NTIsMTEuOTA0LTI5LjE2NCwxMS45MDRDMTA2LjU1NiwxNDMuNzQsMTA2Ljg1LDEzOS4xMSw5OC4zMjUsMTM5LjExeiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6Izg2NDYxQjsiIGQ9Ik05OC43MTIsNDguMjA3VjBDNDguMzU0LDAsMzguOTQ4LDE4LjgxMywzNi41OTYsNTQuMDg2Yy0yLjM1MiwzNS4yNzQsMi45NTgsNDcuNDE3LDYuNDc2LDQ3LjM3MiAgIGMzLjUxOC0wLjA0NiwxLjYyNy00MC40NCw2LjQ1OC00OS4xMzZDNTguMzQ5LDM2LjQ0OSw3NC4xMTMsNDguMjA3LDk4LjcxMiw0OC4yMDd6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojODY0NjFCOyIgZD0iTTk4LjcxMiw0OC4yMDdWMGM1MC4zNTgsMCw1OS43NjQsMTguODEzLDYyLjExNiw1NC4wODZjMi4zNTIsMzUuMjc0LTIuOTU4LDQ3LjQxNy02LjQ3Niw0Ny4zNzIgICBjLTMuNTE4LTAuMDQ2LTEuNjI3LTQwLjQ0LTYuNDU4LTQ5LjEzNkMxMzkuMDc2LDM2LjQ0OSwxMjMuMzExLDQ4LjIwNyw5OC43MTIsNDguMjA3eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6Izc0NEEyNTsiIGQ9Ik02Ny4wMTQsMTY1LjEwOWMtMjIuMjA2LDcuNTAyLTQwLjExNSwyMS4xOTktNDAuMTE1LDMxLjU0Mmg0MC4xMTd2LTMxLjU0Mkg2Ny4wMTR6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojNTczNTE0OyIgZD0iTTY5LjE1MSwxOTYuNjUxdi0zMy44MDVjMCwwLTUuNzMyLDIuMjA1LTcuNzE2LDMuMjMzbC01Ljg1LDMwLjU3MUg2OS4xNTF6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojNzQ0QTI1OyIgZD0iTTEyOS42MzgsMTY1LjEwOWMyMi4yMDYsNy41MDIsNDAuMTE1LDIxLjE5OSw0MC4xMTUsMzEuNTQyaC00MC4xMTd2LTMxLjU0MkgxMjkuNjM4eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzU3MzUxNDsiIGQ9Ik0xMjcuNSwxOTYuNjUxdi0zMy44MDVjMCwwLDUuNzMyLDIuMjA1LDcuNzE2LDMuMjMzbDUuODUsMzAuNTcxSDEyNy41eiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' />
                  </span>
                } 
              >
                <Dropdown.Menu>
                  <Dropdown.Item text='My Profile' />
                  <Dropdown.Item text='Notification Settings' />
                  <Dropdown.Item text='Help' />
                  <Dropdown.Item text='Sign Out' />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>
    )
  }
}

export default withRouter(Header);
