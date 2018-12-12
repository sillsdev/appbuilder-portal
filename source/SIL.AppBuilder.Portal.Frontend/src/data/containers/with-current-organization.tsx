import * as React from 'react';
import { get } from 'lodash';
import { withData, WithDataProps } from 'react-orbitjs';
import { connect } from 'react-redux';
import { compose, branch, withProps, lifecycle } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';
import { Redirect } from 'react-router';

import { TYPE_NAME } from '../models/organization';
import { OrganizationResource, withLoader } from '@data';
import { withCurrentUser } from '@data/containers/with-current-user';

import { buildFindRecord } from '@data/store-helpers';
import * as toast from '@lib/toast';
import { withTranslations } from '@lib/i18n';
import { setCurrentOrganization } from '@store/data';

export interface IProvidedProps {
  currentOrganizationId: string | number;
  currentOrganization: OrganizationResource;
}

export interface IReduxProps {
  currentOrganizationId: string | number;
  setCurrentOrganizationId: (id: string) => void;
}

export type IDataProps =
  & { error?: Error, organization?: OrganizationResource }
  & WithDataProps;

export type IProps =
  & IProvidedProps
  & IDataProps
  & IReduxProps;

// all organizations the user can select have already been loaded from
// the with-current-user HOC
export function withCurrentOrganization(InnerComponent) {
  class WrapperClass extends React.Component<IProps> {
    render() {
      const { currentOrganizationId, organization, setCurrentOrganizationId } = this.props;

      // if (!organization) {
      //   setCurrentOrganizationId('');
      // }

      const dataProps = {
        currentOrganization: organization || null,
        currentOrganizationId: currentOrganizationId || '',
      };

      return <InnerComponent { ...this.props } { ...dataProps } />;
    }
  }

  return compose<IProps, IProvidedProps>(
    connect(
      ({ data }) => {
        return { currentOrganizationId: data.currentOrganizationId };
      },
      (dispatch) => {
        return {
          setCurrentOrganizationId: (id: string) => dispatch(setCurrentOrganization(id))
        };
      }),
    withCurrentUser(),
    withData({}),
    lifecycle<IProvidedProps & WithDataProps & IReduxProps, {}>({
      shouldComponentUpdate(nextProps, nextState) {
        return (
          this.props.currentOrganizationId !== nextProps.currentOrganizationId
          || get(this.state, 'organization.id') !== get(nextState, 'organization.id')
          || get(this.state, 'error.message') !== get(nextState, 'error.message')
        );
      },
      componentDidMount() {
        this.tryGetOrganization();
      },
      componentDidUpdate() {
        this.tryGetOrganization();
      },
      async tryGetOrganization() {
        const { currentOrganizationId, dataStore, setCurrentOrganizationId } = this.props;

        if (!currentOrganizationId || currentOrganizationId === '') {
          this.setState({ organization: undefined });
          return;
        }

        try {
          const organization = await dataStore.cache
            .query(q => buildFindRecord(q, TYPE_NAME, currentOrganizationId));

          this.setState({ organization, error: undefined });
        } catch (error) {
          setCurrentOrganizationId('');

          this.setState({ error });
        }
      }
    }),
    // this loader should hopefully never be visible because
    // the organization should already be present from the current user
    withLoader((props: IProvidedProps & IDataProps) => {
      const { currentOrganizationId, organization, error } = props;
      const noId = (!currentOrganizationId || currentOrganizationId === '');

      if (noId) { return false; }

      return  !organization;
    })
  )(WrapperClass);
}

export function requireOrganizationToBeSelected(InnerComponent) {
  return compose(
    withTranslations,
    branch(
      (props: IProvidedProps) => props.currentOrganizationId === '',
      () => ({ t }: any) => {

        toast.warning(t('errors.orgMustBeSelected'));

        return <Redirect to={'/'} push={true} />;
      }
    )
  )(InnerComponent);
}
