
import * as React from 'react';
import Header from '@ui/components/header';
import Sidebar from '@ui/components/sidebar';

import './layout.scss';

class Layout extends React.Component {

  render() {
    return (
      <div className='wrapper flex-grow'>
        <Sidebar />
        <Header />
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export const withLayout = (Component) => (props) => (
  <Layout><Component { ...props } /></Layout>
);

export default Layout;
