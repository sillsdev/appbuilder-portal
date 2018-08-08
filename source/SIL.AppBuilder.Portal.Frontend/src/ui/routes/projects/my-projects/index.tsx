import * as React from 'react';
import { compose } from 'recompose';

import ProjectTable from './table';
import Header from '../header';

export const pathName = '/projects/own';

class Projects extends React.Component {

  render() {

    return (
      <div className='ui container projects'>
        <Header/>
        <ProjectTable/>
      </div>
    );
  }
}

export default Projects;