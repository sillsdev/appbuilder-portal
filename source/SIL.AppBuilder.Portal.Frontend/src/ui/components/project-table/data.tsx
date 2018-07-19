import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME } from '@data/models/project';

function mapRecordsToProps(passedProps) {
  const {
    sortProperty, defaultSort,
    filterOptions, pageOptions
  } = passedProps;

  return {
    fromCache: q =>
      q.findRecords(TYPE_NAME)
       .sort(sortProperty || defaultSort)
       .filter(filterOptions || [])
       .page({ offset: 0, limit: 20, ...( pageOptions || {} ) })
  };
}

// http://orbitjs.com/v0.15/guide/querying-data.html
export function withData(WrappedComponent) {
  class DataWrapper extends React.Component {
    state = {};

    fetchData = async () => {
      const {
        queryStore,
        sortProperty, defaultSort,
        filterOptions, pageOptions
      } = this.props;

      const records = await queryStore(
        q => (
          q.findRecords(TYPE_NAME)
           .sort(sortProperty || defaultSort)
           .filter(filterOptions || [])
           .page({ offset: 0, limit: 20, ...( pageOptions || {} ) })
        ), {
          label: `Query Projects`,
          sources: {
            remote: {
              include: ['products', 'organization']
            }
          }
        }
      );

      this.setState({ fromNetwork: records });
    }

    render() {
      const { fromNetwork } = this.state;
      const { fromCache } = this.props;

      if (!fromCache) this.fetchData();

      const dataProps = {
        projects: fromCache || fromNetwork,
        isLoading: !fromNetwork
      };

      return (
        <WrappedComponent
          { ...dataProps }
          { ...this.props }
        />
      );
    }
  }

  return withOrbit(mapRecordsToProps)(DataWrapper)
}
