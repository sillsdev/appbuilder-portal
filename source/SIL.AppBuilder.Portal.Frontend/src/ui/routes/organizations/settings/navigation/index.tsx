import * as React from 'react';
import { match as Match, withRouter, RouteComponentProps } from 'react-router';
import { Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import ResponsiveNav from '@ui/components/semantic-extensions/responsive-sub-navigation';

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
      <ResponsiveNav
        items={[
          { to: infoPath.replace(/:orgId/, orgId), text: 'Basic Info' },
          { to: productsPath.replace(/:orgId/, orgId), text: 'Products' },
          { to: groupsPath.replace(/:orgId/, orgId), text: 'Groups' },
          { to: infrastructurePath.replace(/:orgId/, orgId), text: 'Infrastructure' },
        ]}
      />
    );

    return (
      <div className='ui menu flex-flex-column-sm menu'>

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

      </div>
    );
  }
}

export default withRouter(Navigation);
