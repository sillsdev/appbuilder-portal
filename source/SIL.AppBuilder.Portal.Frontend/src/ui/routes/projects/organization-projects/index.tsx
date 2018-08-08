import * as React from 'react';
import { compose } from 'recompose';

import ProjectTable from './table';
import Header from '../header';

export const pathName = '/projects/organization';

class OrganizationProjects extends React.Component {

  render() {
    return (
      <>
        <Header filter='organization' />
        <ProjectTable />
      </>
    );
  }
}

export default OrganizationProjects;