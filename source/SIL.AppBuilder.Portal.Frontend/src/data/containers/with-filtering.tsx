import * as React from 'react';
import { FindRecordsTerm } from '@orbit/data';

import { isEmpty } from '@lib/collection';

export interface IFilter {
  attribute: string;
  value: string | number;
  op?: string;
}

export interface IProvidedProps {
  filters: IFilter[];
  updateFilter: (filter: IFilter) => void;
  applyFilter: (builder: FindRecordsTerm) => FindRecordsTerm;
}

interface IState {
  filters: IFilter[];
}

interface IFilterOptions {
  defaultFilters?: IFilter[];
  requiredFilters?: IFilter[];
}

const defaultOptions = {
  defaultFilters: [],
  requiredFilters: []
};

// example hookup
//
//
// const mapNetworkToProps = ({ applyFilter }) => ({
//   projects: [
//     q => applyFilter(q.findRecords(PROJECT)))
//            .sort('name'),
//   ]
// });
export function withFiltering(opts: IFilterOptions = {}) {
  const options = {
    ...defaultOptions,
    ...opts
  };

  return WrappedComponent => {
    class FilterWrapper extends React.Component<{}, IState> {
      state = { filters: options.defaultFilters };

      updateFilter = (filter: IFilter) => {
        this.setState({ filters: [ filter ] });
      }

      applyFilter = (builder: FindRecordsTerm): FindRecordsTerm => {
        const { filters } = this.state;

        if (isEmpty(filters) && isEmpty(options.requiredFilters)) {
          return builder;
        }
        debugger;

        return builder.filter(...filters, ...options.requiredFilters);
      }

      render() {
        const { filters } = this.state;
        const filterProps: IProvidedProps = {
          filters,
          updateFilter: this.updateFilter,
          applyFilter: this.applyFilter
        };

        return (
          <WrappedComponent
            { ...this.props }
            { ...filterProps }
            />
        );
      }
    }

    return FilterWrapper;
  }
}
