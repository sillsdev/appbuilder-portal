import * as React from 'react';
import { compose } from 'recompose';
import { WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as PROJECT, ProjectAttributes } from '@data/models/project';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as OWNER } from '@data/models/user';

import { query, defaultSourceOptions } from '@data';

import { PageLoader as Loader } from '@ui/components/loaders';

function mapNetworkToProps(passedProps) {

  return {
    projects: [
      q => q.findRecords(PROJECT),
      {
        sources: {
          settings: {
            ...defaultSourceOptions
          }
        }
      }
    ]
  };
}

interface IOwnProps {
  projects: Array<JSONAPI<ProjectAttributes>>;
}

type IProps =
  & IOwnProps
  & WithDataProps;


export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    isLoading = () => {

      const { projects } = this.props;
      return !projects;
    }


    render() {

      const {
        projects,
        ...otherProps
      } = this.props;

      const dataProps = {
        projects
      };

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
    query(mapNetworkToProps),
  )(DataWrapper);
}
