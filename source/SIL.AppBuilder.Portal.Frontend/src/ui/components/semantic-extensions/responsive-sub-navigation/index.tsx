import * as React from 'react';
import { Menu, Dropdown }  from 'semantic-ui-react';
import { RouteComponentProps } from 'react-router';
import { NavLink, withRouter } from 'react-router-dom';


export interface IProps {
  items: Array<{ to: string, text: string }>;
}

class ResponsiveSubNav extends React.Component<IProps & RouteComponentProps<{}>> {

  activeText = () => {
    const { items, location } = this.props;

    const matchingItem = items.find(i => {
      return (i.to === location.pathname);
    });

    return matchingItem.text || 'Setting Navigation...';
  }

  render() {
    const { items } = this.props;

    const menuItems = items.map((i, index) => (

      <Menu.Item exact
        key={index}
        as={NavLink}
        to={i.to}
        activeClassName='active'>

        {i.text}

      </Menu.Item>

    ));

    return (
      <>
        {/* The mobile menu */}
        <Dropdown
          text={this.activeText()}
          className='
            mobile
            d-xs-flex d-sm-none w-100
            justify-content-space-between
          '>
          <Dropdown.Menu className='w-100'>{menuItems}</Dropdown.Menu>
        </Dropdown>


        {/* The non-mobile menu */}
        <Menu vertical className='d-xs-none d-sm-block'>
          {menuItems}
        </Menu>
      </>
    );
  }
}

export default withRouter(ResponsiveSubNav);
