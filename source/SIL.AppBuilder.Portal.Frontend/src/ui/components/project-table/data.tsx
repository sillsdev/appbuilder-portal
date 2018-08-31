import * as React from 'react';
import { compose } from 'recompose';
import { FindRecordsTerm } from '@orbit/data';
import { WithDataProps } from 'react-orbitjs';

import { IProvidedProps as IFilterProps } from '@data/containers/with-filtering';
import { TYPE_NAME as PROJECT, ProjectAttributes } from '@data/models/project';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as OWNER } from '@data/models/user';

import { query, defaultSourceOptions, PROJECTS_TYPE } from '@data';

import { PageLoader as Loader } from '@ui/components/loaders';
import { ResourceObject } from 'jsonapi-typescript';

function mapNetworkToProps(passedProps: IFilterProps) {
  const { applyFilter, filters } = passedProps;

  return {
    cacheKey: [filters],
    projects: [
      q => applyFilter(q.findRecords(PROJECT)),
      {
        sources: {
          remote: {
            settings: {
              ...defaultSourceOptions()
            }
          }
        }
      }
    ]
  };
}

export interface IOwnProps {
  projects: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
  error?: any;
  applyFilter: (builder: FindRecordsTerm) => FindRecordsTerm;
}

type IProps =
  & IOwnProps
  & WithDataProps;


export function withData(WrappedComponent) {
  class DataWrapper extends React.Component<IProps> {

    isLoading = () => {
      const { projects, error } = this.props;

      return !error && !projects;
    }


    render() {
      const { error, projects, ...otherProps } = this.props;
      const dataProps = { projects, error };

      if (this.isLoading()) {
        return <Loader/>;
      }

      return (
        <WrappedComponent
          { ...dataProps }
          { ...otherProps }
        />
      );
    }
  }

  return compose(
    query(mapNetworkToProps, { passthroughError: true }),
  )(DataWrapper);
}
