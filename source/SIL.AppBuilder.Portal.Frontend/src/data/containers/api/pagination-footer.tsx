import * as React from 'react';
import Pagination from 'semantic-ui-react/dist/commonjs/addons/Pagination';

import { IPaginateProps } from './pagination';

export class PaginationFooter extends React.Component<IPaginateProps> {
  onPageChange = (e, { activePage }) => {
    const { setOffset } = this.props;

    setOffset(activePage);
  }

  render() {
    // TODO: figure out how to get total pages from the response

    const { currentPageOffset } = this.props;

    return (
      <Pagination
        totalPages={10}
        activePage={currentPageOffset}
        onPageChange={this.onPageChange}
      />
    );
  }
}