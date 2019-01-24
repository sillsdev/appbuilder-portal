import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { NavLink, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';

import './navigation.scss';

export interface IProps {
  items: { to: string; text: string }[];
  exactRoutes?: boolean;
}

class ResponsiveSubNav extends React.Component<IProps & RouteComponentProps<{}>> {
  activeText = () => {
    const { items, location } = this.props;

    const matchingItem = items.find((i) => {
      return location.pathname.startsWith(i.to);
    });

    return (matchingItem && matchingItem.text) || 'Setting Navigation...';
  };

  render() {
    const { items, location, exactRoutes = true } = this.props;

    const shouldUseExactRoutes = exactRoutes
      ? (to) => location.pathname === to
      : (to) => location.pathname.startsWith(to);

    const menuItems = items.map((i, index) => (
      <NavLink
        to={i.to}
        key={index}
        className='item'
        activeClassName='active'
        isActive={() => shouldUseExactRoutes(i.to)}
      >
        {i.text}
      </NavLink>
    ));

    return (
      <div className='responsive-sub-navigation'>
        {/* The mobile menu */}
        <Dropdown
          text={this.activeText()}
          className='
            mobile
            d-xs-flex d-sm-none w-100
            justify-content-space-between
          '
        >
          <Dropdown.Menu className='w-100'>{menuItems}</Dropdown.Menu>
        </Dropdown>

        {/* The non-mobile menu */}
        <div className='ui menu vertical d-xs-none d-sm-block'>{menuItems}</div>
      </div>
    );
  }
}

export default withRouter(ResponsiveSubNav);
