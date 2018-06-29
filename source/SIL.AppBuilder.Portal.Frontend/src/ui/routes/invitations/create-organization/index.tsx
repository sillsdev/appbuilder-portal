import * as React from 'react';
import { match as Match, Redirect } from 'react-router';

import CreateOrganizationForm from './form';

export const pathName = '/invitations/organization/:token';

export interface Params {
  token: string;
}

export interface IProps {
  match: Match<Params>;
}

export default class CreateOrganizationRoute extends React.Component<IProps> {
  render() {
    const { match } = this.props;
    const { params: { token } } = match;



    return (
      <div>
        <h1>You have been invited to create an organization!</h1>

        <CreateOrganizationForm />
      </div>
    );
  }
}
