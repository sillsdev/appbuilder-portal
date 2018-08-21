import * as React from 'react';

import Header from './header';
import Row from './row';
import { ProjectAttributes } from '@data/models/project';

interface IOwnProps {
  projects: Array<JSONAPI<ProjectAttributes>>;
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
