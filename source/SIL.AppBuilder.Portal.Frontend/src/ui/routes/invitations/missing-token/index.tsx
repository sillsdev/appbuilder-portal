import * as React from 'react';
import { match as Match, Redirect } from 'react-router';

import { pathName as notFoundPath } from '@ui/routes/errors/not-found';

export const pathName = '/invitations/missing-token';

export interface Params {
  token: string
}

export interface IProps {
  match: Match<Params>
}

export default class CreateOrganizationRoute extends React.Component<IProps> {
  render() {
    const { match } = this.props;
    const { params } = match;

    if (params.token && params.token !== '') {
      return <Redirect to={notFoundPath} />
    }

    return (
      <div>
        <h1>Your invitation token is missing</h1>
        <p>
          Please check the link and try again.
        </p>
      </div>
    );
  }
}
