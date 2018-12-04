import * as React from 'react';
import { Dropdown }  from 'semantic-ui-react';
import { NavLink, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';

import './navigation.scss';

export interface IProps {
  items: Array<{ to: string, text: string }>;
}

class ResponsiveSubNav extends React.Component<IProps & RouteComponentProps<{}>> {

  activeText = () => {
    const { items, location } = this.props;

    const matchingItem = items.find(i => {
      return (location.pathname.startsWith(i.to));
    });

    return matchingItem.text || 'Setting Navigation...';
  }

  render() {
    const { items, location } = this.props;

    const menuItems = items.map((i, index) => (
      <NavLink
        to={i.to}
        key={index}
        className='item'
        activeClassName='active'
        isActive={() => location.pathname.startsWith(i.to)}
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
          '>
          <Dropdown.Menu className='w-100'>
            {menuItems}
          </Dropdown.Menu>
        </Dropdown>


        {/* The non-mobile menu */}
        <div className='ui menu vertical d-xs-none d-sm-block'>
          {menuItems}
        </div>
      </div>
    );
  }
}

export default withRouter(ResponsiveSubNav);
