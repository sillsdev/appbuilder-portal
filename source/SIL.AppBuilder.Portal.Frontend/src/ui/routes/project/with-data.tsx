import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as PROJECT } from '@data/models/project';
import { PLURAL_NAME as PRODUCTS } from '@data/models/product';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { defaultSourceOptions } from '@data';

function isEmpty(data) {
  return (!data || (Array.isArray(data) && data.length === 0));
}

const mapRecordsToProps = (ownProps) => {
  const { match } = ownProps;
  const { params: { id } } = match;

  return {
    fromCache: q => q.findRecord({ id, type: PROJECT }),
  };
};


export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<WithDataProps> {

    state = {
      fromNetwork: null
    };

    fetchData = async () => {
      const { queryStore, match } = this.props;
      const { params: { id } } = match;

      const record = await queryStore(
        q => (
          q.findRecord({ type: PROJECT, id })
        ), {
          label: `Query Project`,
          sources: {
            remote: {
              settings: {
                ...defaultSourceOptions()
              },
              include: [ORGANIZATION]
            }
          }
        }
      );

      this.setState({ fromNetwork: record });
    }

    componentDidMount() {

      const { fromNetwork } = this.state;
      const { fromCache } = this.props;

      if (isEmpty(fromCache) && isEmpty(fromNetwork)) { this.fetchData(); }
    }


    render() {

      const { fromNetwork } = this.state;
      const { fromCache } = this.props;

      const dataProps = {
        project: !isEmpty(fromCache) ? fromCache : fromNetwork,
        isLoading: isEmpty(fromNetwork)
      };

      console.log(dataProps);

      return (
        <WrappedComponent
          {...this.props}
          {...dataProps}
        />
      );
    }
  }

  return withOrbit(mapRecordsToProps)(DataWrapper);
}
