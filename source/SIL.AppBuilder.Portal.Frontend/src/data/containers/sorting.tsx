import * as React from 'react';

export enum SortDirection {
  Up = 0,
  Down = 1
}

export interface ISortProps {
  sortProperty: string;
  sortDirection: string;
  sort: (property: string, direction: SortDirection) => void;
}

export interface ISortOptions {
  defaultSort: string | string[];
}

// TODO: allow multi-property sort?
//       currently this only allows sorting of one property at a time
export function withSorting(options) {
  const { defaultSort } = options;

  return WrappedComponent => {
    class SortWrapper extends React.Component<any, { sortProperty: string }> {
      state = { sortProperty: '' };

      sort = (by: string, direction: SortDirection) => {
        const prefix = direction === SortDirection.Up ? '' : '-';

        const sortProperty = `${prefix}${by}`;

        this.setState({ sortProperty });
      }

      render() {
        const { sortProperty } = this.state;

        const sortProps = {
          sort: this.sort,
          sortProperty,
          defaultSort
        };

        return (
          <WrappedComponent
            { ...sortProps }
            { ...this.props }
          />
        );
      }
    }

    return SortWrapper;
  }
}
