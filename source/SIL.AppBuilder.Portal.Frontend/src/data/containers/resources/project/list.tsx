import { compose } from 'recompose';
import { FindRecordsTerm } from '@orbit/data';

import { buildOptions } from '@data';
import { IProvidedProps as IFilterProps } from '@data/containers/with-filtering';
import { TYPE_NAME as PROJECT, ProjectAttributes } from '@data/models/project';

import { query, PROJECTS_TYPE } from '@data';

import { ResourceObject } from 'jsonapi-typescript';

export interface IOwnProps {
  projects: Array<ResourceObject<PROJECTS_TYPE, ProjectAttributes>>;
  error?: any;
  applyFilter: (builder: FindRecordsTerm) => FindRecordsTerm;
}

export function withNetwork<TWrappedProps>(WrappedComponent) {
  function mapNetworkToProps(passedProps: IFilterProps & TWrappedProps) {
    const { applyFilter, filters } = passedProps;

    return {
      cacheKey: [filters],
      projects: [
        q => applyFilter(q.findRecords(PROJECT)), buildOptions()
      ]
    };
  }

  return compose(
    query(mapNetworkToProps, { passthroughError: true }),
  )(WrappedComponent);
}
