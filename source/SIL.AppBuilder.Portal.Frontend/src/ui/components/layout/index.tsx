
import * as React from 'react';
import Header from '@ui/components/header';

class Layout extends React.Component {

  render() {
    return (
      <div className='wrapper'>
        <Header />
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Layout;
