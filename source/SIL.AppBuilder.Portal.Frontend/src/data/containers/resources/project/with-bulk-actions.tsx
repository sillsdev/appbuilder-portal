import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { defaultOptions, ProjectResource } from '@data';

import { idFromRecordIdentity } from '@data/store-helpers';
import { defaultHeaders } from '@lib/fetch';

import { api as apiEnv } from '@env';

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

      // return dataStore.update(q =>
      //   projects.map(p => {
      //     debugger;
      //     const id = idFromRecordIdentity(p);
      //     return q.replaceAttribute({
      //       type: 'project',
      //       id
      //     }, 'dateArchived', moment().format('YYYY-MM-DD HH:mm:ss'));
      //   }),
      //   defaultOptions()
      // );

      const baseUrl = apiEnv.host ? `http://${apiEnv.host}` : '/';

      //Hardcode test
      const headers = {
        ...defaultHeaders()
      };
      const data = {
        operations: [{
          "op": "update",
          "data": {
            id: "11",
            type: "project",
            attributes: {
              "date-archived": moment().format('YYYY-MM-DD HH:mm:ss')
            }
          }
        }]
      }

      fetch(`${baseUrl}/JsonApiOperations/PatchAsync`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(data)
      });
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