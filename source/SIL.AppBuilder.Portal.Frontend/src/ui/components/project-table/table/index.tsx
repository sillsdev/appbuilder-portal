import * as React from 'react';

import { ResourceObject } from 'jsonapi-typescript';

import { PROJECTS_TYPE } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { ISortProps } from '@data/containers/api/sorting';

import { IProvidedProps as ITableColumns } from './with-table-columns';
import Header from './header';
import Row from './row';

interface IOwnProps {
  projects: Array<ResourceObject<PROJECTS_TYPE, ProjectAttributes>>;
}

type IProps =
  & IOwnProps
  & ITableColumns
  & ISortProps;

class Table extends React.Component<IProps> {

  render() {

    const {
      projects,
      selectedColumns,
      activeProjectColumns,
      activeProductColumns
    } = this.props;

    return (
      <div data-test-project-table className='project-table'>
        <Header { ...this.props } />
        {
          projects && projects.map((project, index) => {

            const rowProps = {
              project,
              selectedColumns,
              activeProjectColumns,
              activeProductColumns
            };

            return <Row key={index} {...rowProps} />;
          })
        }
      </div>
    );
  }

}

export default Table;
