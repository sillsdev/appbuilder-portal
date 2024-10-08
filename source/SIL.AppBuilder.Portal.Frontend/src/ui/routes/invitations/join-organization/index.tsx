import * as React from 'react';
import { match as Match, Redirect } from 'react-router';
import { compose } from 'recompose';
import { requireAuth } from '@lib/auth';
import { patch, tryParseJson } from '@lib/fetch';
import { pathName as notFoundPath } from '@ui/routes/errors/not-found';
import { pushPayload, firstError } from '@data';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';
import { RedeemOrganizationMembershipInviteError } from '@data/errors/redeem-organization-membership-invite-error';

import OrganizationMembershipInvitiationLoading from './display';

export const pathName = '/invitations/organization-membership/:token';

interface Params {
  token: string;
}

interface IOwnProps {
  match: Match<Params>;
}

type IProps = IOwnProps & ICurrentUserProps;

interface IState {
  isLoading: boolean;
  error?: Error;
}

class JoinOrganizationRoute extends React.Component<IProps, IState> {
  state = {
    isLoading: true,
    error: null,
  };

  get token() {
    return this.props.match.params.token;
  }

  get hasValidToken() {
    return this.token && this.token !== '';
  }

  captureAndThrowError = async (result: any) => {
    if (result.status === 403 || result.status === 404) {
      let json;
      try {
        json = await tryParseJson(result);
      } catch (error) {
        throw new RedeemOrganizationMembershipInviteError(
          'organization-membership.invite.error.invalid-response'
        );
      }
      const error = firstError(json);
      throw new RedeemOrganizationMembershipInviteError(error.title);
    } else {
      const body = await result.text();
      throw new RedeemOrganizationMembershipInviteError(
        'organization-membership.invite.error.unexpected',
        { response: body }
      );
    }
  };

  redeemInvitation = async () => {
    try {
      const result = await patch(`/api/organization-membership-invites/redeem/${this.token}`, {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      if (result.status !== 200) {
        await this.captureAndThrowError(result);
      }

      this.setState({ isLoading: false, error: null });
    } catch (error) {
      this.setState({ isLoading: false, error });
    }
  };

  componentDidMount() {
    if (this.hasValidToken) {
      this.redeemInvitation();
    }
  }

  render() {
    const { isLoading, error } = this.state;

    if (this.hasValidToken) {
      if (isLoading || error) {
        return <OrganizationMembershipInvitiationLoading error={error} />;
      } else {
        return <Redirect push={true} to={'/organization-membership-changed'} />;
      }
    } else {
      return <Redirect push={true} to={notFoundPath} />;
    }
  }
}

export default compose(
  withCurrentUserContext,
  requireAuth({ redirectOnMissingMemberships: false })
)(JoinOrganizationRoute);
