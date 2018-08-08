import * as React from 'react';
import { compose } from 'recompose';

import ProjectTable from './table';
import Header from '../header';

export const pathName = '/projects/archived';

export default class ArchivedProjects extends React.Component {

  render() {
    return (
      <>
        <Header filter='archived' />
        <ProjectTable />
      </>
    );
  }
}