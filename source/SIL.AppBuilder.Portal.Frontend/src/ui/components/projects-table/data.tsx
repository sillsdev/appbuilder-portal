import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as PROJECT } from '@data/models/project';
import { PLURAL_NAME as PRODUCTS } from '@data/models/product';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { ISortProps } from '@data/containers/sorting';
import { IPaginateProps } from '@data/containers/pagination';
import { defaultSourceOptions } from '@data';

function isEmpty(data) {
  return (!data || (Array.isArray(data) && data.length === 0));
}

function mapRecordsToProps(passedProps) {
  const {
    sortProperty, defaultSort,
    filterOptions, pageOptions
  } = passedProps;

  return {
    fromCache: q => {
      return q.findRecords(PROJECT)

    }
       //.sort(sortProperty || defaultSort)
       /* .filter(filterOptions || []) */
       //.page({ offset: 0, limit: 20, ...( pageOptions || {} ) })
  };
}

type IProps =
  & ISortProps
  & IPaginateProps
//  & IFilteringProps
  & WithDataProps;


export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {
    state = {
      fromNetwork: null
    };

    fetchData = async () => {
      const {
        queryStore,
        sortProperty, defaultSort,
        pageOptions
      } = this.props;

      const records = await queryStore(
        q => (
          q.findRecords(PROJECT)
           //.sort(sortProperty || defaultSort)
           // TODO: tweak in JSONAPI pull strategy
           /* .filter(filterOptions || []) */
           //.page({ offset: 0, limit: 20, ...( pageOptions || {} ) })
        ), {
          label: `Query Projects`,
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

      this.setState({ fromNetwork: records });
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
        projects: !isEmpty(fromCache) ? fromCache : fromNetwork,
        isLoading: isEmpty(fromCache) && isEmpty(fromNetwork)
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
