import * as React from 'react';

import Header from './header';
import Row from './row';
import { ProjectAttributes } from '@data/models/project';
import { ResourceObject } from 'jsonapi-typescript';
import { PROJECTS_TYPE } from '@data';

interface IOwnProps {
  projects: ResourceObject<PROJECTS_TYPE, ProjectAttributes>[];
}

type IProps =
  & IOwnProps;


export default class Table extends React.Component<IProps> {

  render() {
    const { projects } = this.props;

    return (
      <div className='project-table'>
        <Header />
        {
          projects && projects.map((project, index) => (
            <Row key={index} project={project} />
          ))
        }
      </div>
    );
  }

}
