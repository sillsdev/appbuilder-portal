import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { defaultOptions, ProjectResource } from '@data';

import {
  withMomentTimezone,
  IProvidedProps as TimezoneProps
} from '@lib/with-moment-timezone';

export interface IProvidedProps {
  bulkArchive: (projects: ProjectResource[]) => any;
  bulkReactivate: (projects: ProjectResource[]) => any;
}

type IProps =
  & WithDataProps
  & TimezoneProps;

export function withBulkActions(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    bulkArchive = (projects: ProjectResource[]) => {
      const { dataStore, moment } = this.props;

      return dataStore.update(q =>
        projects.map(p =>
          q.replaceAttribute(p, 'dateArchived', moment().format('YYYY-MM-DD HH:mm:ss'))
        ),
        defaultOptions()
      );
    }

    bulkReactivate = (projects: ProjectResource[]) => {
      const { dataStore } = this.props;

      return dataStore.update(q =>
        projects.map(p =>
          q.replaceAttribute(p, 'dateArchived', null)
        ),
        defaultOptions()
      );
    }

    render() {
      const props = {
        ...this.props,
        bulkArchive: this.bulkArchive,
        bulkReactivate: this.bulkReactivate
      };

      return <WrappedComponent {...props} />;
    }
  }

  return compose(
    withOrbit({}),
    withMomentTimezone
  )(DataWrapper);
}