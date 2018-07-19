import * as React from 'react';

import { ProjectAttributes } from '@data/models/project';

export interface IProps {
  project: JSONAPI<ProjectAttributes>
}

export default class Row extends React.Component<IProps> {
  render() {
    const { project: data } = this.props;
    const { attributes: project } = data;

    return (
      <tr>
        <td>{project.name}</td>
        <td className='bold'>{project.organization.name}</td>
        <td>{project.language}</td>
        <td>{project.status}</td>
        <td>{project.lastUpdatedAt}</td>
        <td />
      </tr>
    );
  }
}
