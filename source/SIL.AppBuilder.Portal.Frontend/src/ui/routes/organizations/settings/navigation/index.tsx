import * as React from 'react';
import { match as Match, withRouter, RouteComponentProps } from 'react-router';
import { Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import {
  infoPath, userPath, productsPath, groupsPath, infrastructurePath
} from '../routes';

export interface Params {
  orgId: string;
}

export type IProps =
  & { match: Match<Params> }
  & RouteComponentProps<{}>;


class Navigation extends React.Component<IProps> {
  render() {
    const { match } = this.props;
    const { params: { orgId } } = match;

    return (
      <Menu vertical>

        <Menu.Item exact as={NavLink}
          to={infoPath.replace(/:orgId/, orgId)}
          activeClassName='active'>
          Basic Info
        </Menu.Item>

        {/* to={userPath.replace(/:orgId/, orgId)} */}
        {/* as={NavLink} */}
        {/* activeClassName='active' */}
        <Menu.Item disabled>
          User Setup
        </Menu.Item>

        <Menu.Item as={NavLink}
          to={productsPath.replace(/:orgId/, orgId)}
          activeClassName='active'>
          Products
        </Menu.Item>

        <Menu.Item as={NavLink}
          to={groupsPath.replace(/:orgId/, orgId)}
          activeClassName='active'>
          Groups
        </Menu.Item>

        <Menu.Item as={NavLink}
          to={infrastructurePath.replace(/:orgId/, orgId)}
          activeClassName='active'>
          Infrastructure
        </Menu.Item>

      </Menu>
    );
  }
}

export default withRouter(Navigation);
