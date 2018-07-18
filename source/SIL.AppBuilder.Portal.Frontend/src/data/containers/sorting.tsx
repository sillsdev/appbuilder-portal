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

export function withSorting(options) {
  return WrappedComponent => {
    return props => <WrappedComponent {...props } />;
  }
}
