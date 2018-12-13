import { withData, WithDataProps } from 'react-orbitjs';
import { connect } from 'react-redux';
import {
  compose, withProps, branch, renderComponent
} from 'recompose';

import { State } from '@store/reducers';
import { withLoader, buildFindRecord } from '@data';
import { setCurrentOrganization } from '@store/data';
import { withCurrentUser } from '@data/containers/with-current-user';

import { IProps, IProvidedProps, IDataProps } from './types';

// all organizations the user can select have already been loaded from
// the with-current-user HOC
export const withCurrentOrganization = compose<IProps, IProvidedProps>(
  withCurrentUser(),
  connect(
    ({ data }: State) => {
      return { currentOrganizationId: data.currentOrganizationId };
    },
    (dispatch) => {
      return {
        setCurrentOrganizationId: (id: string) => dispatch(setCurrentOrganization(id))
      };
    }
  ),
  branch(
    ({ currentOrganizationId: id }) => (id && `${id}`.length > 0),
    compose(
      withData((passedProps: IProps) => {
        const { currentOrganizationId: id } = passedProps;

        if (!id || id === '') return {};

        return {
          organization: q => buildFindRecord(q, 'organization', id)
        }
      }),
      // this loader should hopefully never be visible because
      // the organization should already be present from the current user
      // request
      withLoader((props: IProvidedProps & IDataProps) => {
        const { currentOrganizationId, organization, error } = props;
        const noId = (!currentOrganizationId || currentOrganizationId === '');

        if (noId) { return false; }

        return  !organization;
      }),
    )
  ),
  withProps((props: IProps) => {
    const { currentOrganizationId, organization, setCurrentOrganizationId } = props;

    return {
      currentOrganization: organization || null,
      currentOrganizationId: currentOrganizationId || '',
    };
  })
);
