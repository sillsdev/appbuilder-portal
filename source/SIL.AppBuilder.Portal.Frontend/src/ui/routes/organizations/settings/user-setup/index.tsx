import * as React from 'react';
import { match as Match } from 'react-router';

export const pathName = '/organizations/:orgId/settings/user-setup';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  organization: any;
}

class UserSetupRoute extends React.Component<IProps> {
  render() {
    const { match } = this.props;
    const {
      params: { orgId },
    } = match;

    return 'Settings: User Setup';
  }
}

export default UserSetupRoute;
