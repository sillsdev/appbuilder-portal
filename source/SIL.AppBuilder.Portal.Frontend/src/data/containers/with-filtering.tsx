import * as React from 'react';
import { FindRecordsTerm } from '@orbit/data';
import { camelize } from '@orbit/utils';

import { isEmpty } from '@lib/collection';

export interface IFilter {
  attribute: string;
  value: string | number;
  op?: string;
}

export interface IProvidedProps {
  filters: IFilter[];
  updateFilter: (filter: IFilter) => void;
  applyFilter: (builder: FindRecordsTerm, onCache?: boolean, ignoreRequired?: boolean) => FindRecordsTerm;
  removeFilter: (filter: IFilter | string) => void;
}

interface IFilterOptions {
  defaultFilters?: IFilter[];
  requiredFilters?: IFilter[];
}

interface IState {
  filters: IFilter[];
  options: IFilterOptions;
}

const defaultOptions = {
  defaultFilters: [],
  requiredFilters: [],
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
  let optionsFunction;

  if (typeof opts !== 'function') {
    optionsFunction = (props) => opts;
  } else {
    optionsFunction = opts;
  }

  return WrappedComponent => {
    class FilterWrapper extends React.Component<{}, IState> {
      constructor(props) {
        super(props);

        const options = {
          ...defaultOptions,
          ...optionsFunction(props)
        };

        const filters = [
          ...options.defaultFilters
        ];

        this.state = { filters, options };
      }

      // TODO: currently this only sets a filter.
      //       this should find and replace via attribute.
      updateFilter = (filter: IFilter) => {
        const { filters } = this.state;

        const newFilters = filters.filter(currentFilter => {
          return currentFilter.attribute !== filter.attribute;
        });

        newFilters.push(filter);

        this.setState({ filters: newFilters });
      }

      removeFilter = (filter: IFilter | string) => {
        const { filters } = this.state;
        const attrToRemove = (filter as IFilter).attribute || filter;

        const newFiletrs = filters.filter(currentFilter => {
          return currentFilter.attribute !== attrToRemove;
        });

        this.setState({ filters: newFiletrs });
      }

      // NOTE: onCache signifies that that the filtering will only happen on the cache store.
      //       This, unfortunately is needed due to the backend and frontend not having
      //       the same filter implementation.
      //       For example:
      //       - on the backend: { attribute: 'date-archived', value: 'isnull:' }
      //       - on the frontend: { attribute: 'dateArchived', value: null },
      //       these are equivalent.
      //       this technical limitation also stems from the fact that all values
      //       are strings when sent across the network.
      applyFilter = (builder: FindRecordsTerm, onCache = false, ignoreRequired = false): FindRecordsTerm => {
        const { filters, options } = this.state;

        if (isEmpty(filters) && isEmpty(options.requiredFilters)) {
          return builder;
        }

        const required = ignoreRequired ? [] : options.requiredFilters;
        const allFilters = [ ...filters, ...required ];
        const filtersToApply = onCache ? allFilters.map(this._filterOperationMap) : allFilters;

        return builder.filter(...filtersToApply);
      }

      _filterOperationMap(filter: IFilter): IFilter {
        const attribute = camelize(filter.attribute);

        switch(filter.value) {
          case 'isnull:': return { ...filter, attribute, value: null };
          case 'isnotnull:': return { ...filter, attribute, value: '', op: 'gt' };
          // TODO: write a mapping for like for locale query
          // TODO: also consider a different scheme of mapping remote filtering
          //       with local filtering
          // case 'like:': return { ...filter, attribute, value:}
          default: return { ...filter, attribute };
        }
      }

      render() {
        const { filters } = this.state;
        const filterProps: IProvidedProps = {
          filters,
          updateFilter: this.updateFilter,
          applyFilter: this.applyFilter,
          removeFilter: this.removeFilter
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
  };
}
