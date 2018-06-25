
import React from 'react';
import Header from '@ui/components/header';

const Layout = ({children}) => (
  <div className='wrapper'>
    <Header/>
    <div>
      {children}
    </div>
  </div>
)

export default Layout;