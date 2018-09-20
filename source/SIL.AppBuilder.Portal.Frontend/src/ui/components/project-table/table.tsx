import * as React from 'react';

import Header from './header';
import { IProvidedProps } from './withTableColumns';
import { ProjectAttributes } from '@data/models/project';
import { PROJECTS_TYPE } from '@data';
import { ResourceObject } from 'jsonapi-typescript';
import Row from './row';

interface IOwnProps {
  projects: Array<ResourceObject<PROJECTS_TYPE, ProjectAttributes>>;
}

type IProps =
  & IOwnProps
  & IProvidedProps;


class Table extends React.Component<IProps> {

  render() {

    const {
      projects,
      columns,
      selectedColumns,
      updateColumnSelection,
      isInSelectedColumns,
      columnWidth
    } = this.props;

    const headerProps = {
      columns,
      selectedColumns,
      updateColumnSelection,
      isInSelectedColumns,
      columnWidth
    };

    return (
      <div data-test-project-table className='project-table'>
        <Header { ...headerProps} />
        {
          projects && projects.map((project, index) => {

            const rowProps = {
              project,
              selectedColumns,
              isInSelectedColumns,
              columnWidth
            };

            return <Row key={index} {...rowProps} />;
          })
        }
      </div>
    );
  }

}

export default Table;
