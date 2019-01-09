import * as React from 'react';

import Details from './details';
import Products from './products';
import Owners from './owners';
import Reviewers from './reviewers';
import Settings from './settings';

export default ({ project }) => {
  return (
    <div className='flex-lg p-b-xxl-lg'>
    <div className='flex-grow p-r-lg-lg'>
      <Details project={project} />
      <Products project={project} />
      <Settings project={project} />
    </div>
    <div className='thin-border w-50-lg m-t-lg-xs-only m-t-lg-sm-only'>
      <Owners project={project} />
      <Reviewers project={project} />
    </div>
  </div>
  );
};