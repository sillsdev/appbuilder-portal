import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { OrganizationAttributes, TYPE_NAME } from '../models/organization';
import { isEmpty } from '@lib/collection';
import { defaultSourceOptions } from '@data';

import PageLoader from '@ui/components/loaders/page';
import PageError from '@ui/components/errors/page';

interface IState {
  fromNetwork?: JSONAPI<OrganizationAttributes>;
  error?: any;
}

export function withCurrentOrganization(InnerComponent) {
  const mapStateToProps = ({ data }) => ({
    currentOrganizationId: data.currentOrganizationId
  });

  function mapRecordsToProps(passedProps) {
    return {
      fromCache: q =>
        q.findRecord({ type: TYPE_NAME, id: passedProps.currentOrganizationId })
    };
  }

  class WrapperClass extends React.Component {
    state = { fromNetwork: undefined, error: undefined };

    getOrganization = async () => {
      const { queryStore, currentOrganizationId: id }  = this.props;

      if (id === '') { return; }

      // TODO: do we need to get any common related things?

      try {
        const record = await queryStore(
          q => q.findRecord({ type: TYPE_NAME, id }), {
          sources: {
            remote: {
              settings: {
                ...defaultSourceOptions()
              },
            }
          }
        });

        this.setState({ fromNetwork: record });
      } catch (e) {
        this.setState({ error: e });
      }
    }

    render() {
      const { fromNetwork, error } = this.state;
      const { fromCache, currentOrganizationId } = this.props;
      const org = fromCache || fromNetwork;
      const allOrgs = currentOrganizationId === '';

      if (isEmpty(org) && !allOrgs) { this.getOrganization(); }

      const dataProps = {
        currentOrganization: org,
        currentOrganizationId: currentOrganizationId || '',
      };

      return <InnerComponent { ...this.props } { ...dataProps } />;
    }
  }


  return compose(
    connect(mapStateToProps),
    withData(mapRecordsToProps)
  )(WrapperClass);
}
