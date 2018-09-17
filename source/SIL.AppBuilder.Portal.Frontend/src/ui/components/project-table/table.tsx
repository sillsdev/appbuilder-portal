import * as React from 'react';
import { compose } from 'recompose';

import Header from './header';
import Row from './row';
import { ProjectAttributes } from '@data/models/project';
import { ResourceObject } from 'jsonapi-typescript';
import { PROJECTS_TYPE } from '@data';
import { IProvidedProps } from './withTableColumns';

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
      <div className='project-table'>
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
