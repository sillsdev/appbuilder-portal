import * as React from 'react';

import Header from './header';
import Row from './row';

interface IOwnProps {
  projects: any[]
}

type IProps =
  & IOwnProps
  & WithDataProps
  & ISortProps
  & i18nProps;


export default class Table extends React.Component<IProps> {
  render() {
    return (
      <table className='ui table'>
        <Header />

        {projects.map(project => <Row project={project} />)}

      </table>
    );
  }
}
