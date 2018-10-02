import * as React from 'react';
import * as pick from 'lodash/pick';
import Pagination from 'semantic-ui-react/dist/commonjs/addons/Pagination';

import { GENERIC_ATTRIBUTES } from '@lib/dom';

import { IPaginateProps } from './pagination';

export class PaginationFooter extends React.Component<IPaginateProps> {
  onPageChange = (e, { activePage }) => {
    const { setOffset } = this.props;

    setOffset(activePage);
  }

  render() {
    // TODO: figure out how to get total pages from the response

    const { currentPageOffset, ...otherProps } = this.props;
    const attributeProps = pick(otherProps, GENERIC_ATTRIBUTES);

    return (
      <Pagination
        { ...attributeProps }
        totalPages={10}
        activePage={currentPageOffset}
        onPageChange={this.onPageChange}
      />
    );
  }
}
