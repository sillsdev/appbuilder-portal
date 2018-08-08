import * as React from 'react';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';

import ProjectTable from '@ui/components/project-table';
import Header from '../header';

export const pathName = '/projects';

class Projects extends React.Component {

  render() {

    return (
      <div className='ui container projects'>
        <Header />
        <ProjectTable/>
      </div>
    );
  }
}

export default Projects;