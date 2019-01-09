import { withData, WithDataProps } from 'react-orbitjs';
import { RouteChildrenProps } from 'react-router';
import { connect } from 'react-redux';
import {
  compose, withProps, branch, renderComponent
} from 'recompose';

import { State } from '@store/reducers';
import { withLoader, buildFindRecord, OrganizationResource, idFromRecordIdentity } from '@data';
import { setCurrentOrganization } from '@store/data';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';
import { withRelationships } from '@data/containers/with-relationship';

import {
  IProps, IProvidedProps, IDataProps,
  IWithIntermediateData, IReduxProps
} from './types';

// all organizations the user can select have already been loaded from
// the with-current-user HOC
export const withCurrentOrganization = compose<IProps, IProvidedProps>(
  connect(
    ({ data }: State) => {
      return { currentOrganizationId: data.currentOrganizationId };
    },
    (dispatch, ownProps: RouteChildrenProps) => {
      const { history } = ownProps;

      return {
        setCurrentOrganizationId: (id: string, defaultNav: boolean = true) => {
          dispatch(setCurrentOrganization(id));
          if (defaultNav){
            history.push('/tasks');
          }
        },
      };
    }
  ),
  branch(
    ({ currentOrganizationId: id }) => (id && `${id}`.length > 0),
    compose<IProps, IProvidedProps & IReduxProps>(
      withCurrentUserContext,
      withRelationships(({ currentUser }: ICurrentUserProps) => {
        return {
          currentUserOrganizations: [currentUser, 'organizationMemberships', 'organization'],
        };
      }),
      // this loader should hopefully never be visible because
      // the organization should already be present from the current user
      // request
      withLoader((props: IProvidedProps & IDataProps & IWithIntermediateData) => {
        const { currentOrganizationId, currentUserOrganizations } = props;
        const noId = (!currentOrganizationId || currentOrganizationId === '');

        if (noId) { return false; }

        return  !currentUserOrganizations;
      }),
      withProps((props: IWithIntermediateData & IReduxProps) => {
        const {
          currentOrganizationId: id,
          currentUserOrganizations: organizations
        } = props;

        if (!id || id === '') { return {}; }

        const currentOrganization = organizations.find(org => idFromRecordIdentity(org) === id);

        return { currentOrganization };
      }),
    )
  ),
  withProps((props: IProps) => {
    const { currentOrganizationId, currentOrganization, setCurrentOrganizationId } = props;

    return {
      currentOrganization: currentOrganization || null,
      currentOrganizationId: currentOrganizationId || '',
    };
  })
);
