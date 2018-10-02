import { compose } from 'recompose';

import { ApplicationTypeResource } from '@data';
import { buildOptions } from '@data';
import { TYPE_NAME as APPLICATION_TYPE } from '@data/models/application-type';
import { query } from '@data';

export interface IOwnProps {
  applicationTypes: ApplicationTypeResource[];
  error?: any;
}

export function withList() {

  return WrappedComponent => {

    function mapNetworkToProps() {
      return {
        applicationTypes: [
          q => q.findRecords(APPLICATION_TYPE),
          buildOptions()
        ]
      };
    }

    return compose(
      query(mapNetworkToProps, { passthroughError: true, useRemoteDirectly: true }),
    )(WrappedComponent);
  };
}