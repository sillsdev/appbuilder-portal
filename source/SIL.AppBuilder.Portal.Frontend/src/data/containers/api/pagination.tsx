import * as React from 'react';
import { FindRecordsTerm, OffsetLimitPageSpecifier } from '@orbit/data';

export interface IPaginateProps {
  currentPageSize: number;
  currentPageOffset: number;
  setPageSize: (pageSize: number) => void;
  setOffset: (pageOffset: number) => void;
  applyPagination?: (builder: FindRecordsTerm) => FindRecordsTerm;
  prevPage: () => void;
  nextPage: () => void;
}

interface IOptions {
  pageSize?: number;
  pageOffset?: number;
}

const defaultOptions = {
  pageSize: 20,
  pageOffset: 1
};

interface IState {
  pageSize?: number;
  pageOffset?: number;
}

export function withPagination(opts: IOptions = {}) {
  const options = {
    ...defaultOptions,
    ...opts
  };

  return WrappedComponent => {
    class PaginationWrapper extends React.Component<{}, IState> {
      state: IState = {};

      setPageSize = (pageSize: number) => {
        this.setState({ pageSize });
      }

      nextPage = () => {
        const { pageOffset } = this.state;

        this.setPageSize(pageOffset + 1);
      }

      prevPage = () => {
        const { pageOffset } = this.state;

        let prevPageNumber = pageOffset - 1;

        if (prevPageNumber < 0) { prevPageNumber = 0; }

        this.setPageSize(prevPageNumber);
      }

      setOffset = (pageOffset: number) => {
        this.setState({ pageOffset });
      }

      applyPagination = (builder: FindRecordsTerm): FindRecordsTerm => {
        const { pageSize, pageOffset } = this.state;

        return builder.page({
          offset: pageOffset || options.pageOffset,
          limit: pageSize || options.pageSize
        } as OffsetLimitPageSpecifier);
      }

      render() {
        const { pageSize, pageOffset } = this.state;
        const paginationProps = {
          currentPageSize: pageSize || options.pageSize,
          currentPageOffset: pageOffset || options.pageOffset,
          setPageSize: this.setPageSize,
          setOffset: this.setOffset,
          applyPagination: this.applyPagination,
          nextPage: this.nextPage,
          prevPage: this.prevPage
        };

        return<WrappedComponent { ...paginationProps } { ...this.props } />;
      }
    }

    return PaginationWrapper;
  };
}
