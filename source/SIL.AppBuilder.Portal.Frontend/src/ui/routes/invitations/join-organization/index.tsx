import * as React from 'react';
import { match as Match, Redirect } from 'react-router';
import { compose } from 'recompose';
import { translate, TransProps as I18nProps } from 'react-i18next';
import { requireAuth } from '@lib/auth';

import PageLoader from '@ui/components/loaders/page';
import { pathName as notFoundPath } from '@ui/routes/errors/not-found';

export const pathName = '/invitations/:token';

export interface Params {
  token: string;
}

export interface IProps {
  match: Match<Params>;
}

class JoinOrganizationRoute extends React.Component<IProps & I18nProps> {
  redeemInvitation = async (token) => {
    try {
      //todo send redeem token.
    }
    catch (err) {
      //update state with error
    }
  }

  componentDidMount(){
    const { match, t } = this.props;
    const { params } = match;
    if (params.token && params.token !== '') {
      this.redeemInvitation(params.token);
    }
  }

  render() {
    const { match, t } = this.props;
    const { params } = match;
    if (params.token && params.token !== '') {
      return <PageLoader />;
    }
    else{
      return <Redirect push={true} to={notFoundPath} />;
    }
  }
}

export default compose(
  requireAuth({redirectOnMissingMemberships: false}),
  translate('translations')
)(JoinOrganizationRoute);
