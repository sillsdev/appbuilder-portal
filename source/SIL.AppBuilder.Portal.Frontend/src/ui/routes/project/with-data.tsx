import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { query, defaultSourceOptions, defaultOptions } from '@data';

import { TYPE_NAME as PROJECT, ProjectAttributes } from '@data/models/project';
import { PLURAL_NAME as PRODUCTS } from '@data/models/product';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as GROUP } from '@data/models/group';

import { PageLoader as Loader } from '@ui/components/loaders';

const mapNetworkToProps = (passedProps) => {
  const { match } = passedProps;
  const { params: { id } } = match;

  return {
    cacheKey: `project-${id}`,
    project: [q => q.findRecord({ id, type: PROJECT }), {
      label: 'Find Project',
      sources: {
        remote: {
          settings: { ...defaultSourceOptions() },
          include: [/* PRODUCTS, */ ORGANIZATION, GROUP, 'owner']
        }
      }
    }]
  };
};

const mapRecordsToProps = (passedProps) => {
  const { match } = passedProps;
  const { params: { id } } = match;

  return {
    projectFromCache: q => q.findRecord({ id, type: PROJECT })
  };
};

interface IProps {
  project: JSONAPI<ProjectAttributes>;
  projectFromCache: JSONAPI<ProjectAttributes>;
}

export function withData<T>(WrappedComponent) {
  class DataWrapper extends React.Component<IProps & T> {
    update = async (attributes: ProjectAttributes) => {
      const { project, updateStore } = this.props;
      const { type, id } = project;

      return updateStore(q => q.replaceRecord({
        type, id,
        attributes,
      }), defaultOptions());
    }

    render() {
      const { project, projectFromCache, ...otherProps } = this.props;

      const dataProps = {
        project: projectFromCache || project
      };

      if (!dataProps.project) {
        return <Loader />;
      }

      return <WrappedComponent { ...otherProps } { ...dataProps }/>;
    }
  }

  return compose(
    query(mapNetworkToProps),
    withOrbit(mapRecordsToProps)
  )(DataWrapper);
}
