import * as React from 'react';

export default class Row extends React.Component {
  render() {
    const { project } = this.props;

    return (
      <tr>
        <td>{project.name}</td>
        <td>{project.organization.name}</td>
        <td>{project.language}</td>
        <td>{project.status}</td>
        <td>{project.lastUpdatedAt}</td>
        <td />
      </tr>
    );
  }
}
