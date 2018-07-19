import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as PROJECT } from '@data/models/project';
import { PLURAL_NAME as PRODUCTS } from '@data/models/product';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { ISortProps } from '@data/containers/sorting';
import { IPaginateProps } from '@data/containers/pagination';

function isEmpty(data) {
  return (!data || (Array.isArray(data) && data.length === 0));
}

function mapRecordsToProps(passedProps) {
  const {
    sortProperty, defaultSort,
    filterOptions, pageOptions
  } = passedProps;

  return {
    fromCache: q =>
      q.findRecords(PROJECT)
       .sort(sortProperty || defaultSort)
       /* .filter(filterOptions || []) */
       .page({ offset: 0, limit: 20, ...( pageOptions || {} ) })
  };
}

type IProps =
  & ISortProps
  & IPaginateProps
  & IFilteringProps
  & WithDataProps;

// http://orbitjs.com/v0.15/guide/querying-data.html
export function withData(WrappedComponent) {
  class DataWrapper extends React.Component<IProps> {
    state = {};

    fetchData = async () => {
      const {
        queryStore,
        sortProperty, defaultSort,
        filterOptions, pageOptions
      } = this.props;

      // TODO: remove this when we get real data....
      const fakes = [{
        id: 1,
        type: PROJECT,
        attributes: {
          name: 'project 1',
          organization: { name: 'org 1' }, // this isn't how JSONAPI works, but we need a working API :)
          language: 'pirate',
          status: 'published',
          lastUpdatedAt: 'long ago'
        }
      }, {
        id: 2,
        type: PROJECT,
        attributes: {
          name: 'project 2',
          organization: { name: 'org 1' }, // this isn't how JSONAPI works, but we need a working API :)
          language: 'pirate',
          status: 'published',
          lastUpdatedAt: 'long ago'
        }
      }];

      return this.setState({ fromNetwork: fakes });

      const records = await queryStore(
        q => (
          q.findRecords(PROJECT)
           .sort(sortProperty || defaultSort)
           // TODO: tweak in JSONAPI pull strategy
           /* .filter(filterOptions || []) */
           .page({ offset: 0, limit: 20, ...( pageOptions || {} ) })
        ), {
          label: `Query Projects`,
          sources: {
            remote: {
              include: [PRODUCTS, ORGANIZATION]
            }
          }
        }
      );

      this.setState({ fromNetwork: records });
    }


    render() {
      const { fromNetwork } = this.state;
      const { fromCache } = this.props;

      if (isEmpty(fromCache) && isEmpty(fromNetwork)) this.fetchData();

      const dataProps = {
        // TODO: update once we have an API endpoint
        /* projects: fromCache || fromNetwork, */
        projects: fromNetwork,
        isLoading: isEmpty(fromNetwork)
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
