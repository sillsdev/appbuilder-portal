import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { defaultSourceOptions } from '@data';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { isEmpty } from '@lib/collection';

function mapRecordsToProps(passedProps) {
  const { filterOptions } = passedProps;

  return {
    fromCache: q =>
      q.findRecords(ORGANIZATION)
       /* .filter(filterOptions || []) */
  };
}

type IProps =
  /* & IFilteringProps */
& WithDataProps;

interface IState {
  name?: string;
}

// http://orbitjs.com/v0.15/guide/querying-data.html
export function withData(WrappedComponent) {
  class DataWrapper extends React.Component<IProps, IState> {
    state = { name: '' };

    searchByName = (name) => {
      this.setState({ name }, this.fetchData);
    }

    fetchData = async () => {
      const { queryStore } = this.props;
      const { name } = this.state;

      const records = await queryStore(
        q => q.findRecords(ORGANIZATION)
              .filter({ attribute: 'name', value: name })
        , {
        sources: {
          remote: {
            settings: {
              ...defaultSourceOptions()
            }
          }
        }
      });

      this.setState({ fromNetwork: records });
    }


    render() {
      const { fromNetwork } = this.state;
      const { fromCache } = this.props;

      if (isEmpty(fromCache) && isEmpty(fromNetwork)) { this.fetchData(); }

      const organizations = fromCache || fromNetwork;

      const dataProps = {
        organizations,
        isLoading: isEmpty(organizations),
        searchByName: this.searchByName
      };

      return (
        <WrappedComponent
          { ...dataProps }
          { ...this.props }
        />
      );
    }
  }

  return withOrbit(mapRecordsToProps)(DataWrapper);
}
