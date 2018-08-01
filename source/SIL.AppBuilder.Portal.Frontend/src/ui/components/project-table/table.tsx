import * as React from 'react';

import Header from './header';
import Row from './row';

interface IOwnProps {
  projects: any[];
}

type IProps =
  & IOwnProps;


export default class Table extends React.Component<IProps> {
  render() {
    const { projects } = this.props;

    console.log('Table', this.props);

    return (
      <table className='ui table product-table'>
        <Header />
        <tbody>
        {
          projects && projects.map((project, index) => (
          <Row key={index} project={project} />
        ))}
        </tbody>
      </table>
    );
  }
}
