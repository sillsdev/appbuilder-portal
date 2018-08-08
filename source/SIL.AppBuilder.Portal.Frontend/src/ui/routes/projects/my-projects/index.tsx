import * as React from 'react';
import { compose } from 'recompose';

import ProjectTable from './table';
import Header from '../header';

export const pathName = '/projects/own';

export default class MyProjects extends React.Component {

  render() {
    return (
      <>
        <Header filter='own' />
        <ProjectTable />
      </>
    );
  }
}
