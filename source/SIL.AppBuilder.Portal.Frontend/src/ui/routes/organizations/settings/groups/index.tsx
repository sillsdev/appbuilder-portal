import * as React from 'react';
import { match as Match } from 'react-router';
import { Button } from 'semantic-ui-react';

export const pathName = '/organizations/:orgId/settings/groups';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  organization: any;
}

class GroupsRoute extends React.Component<IProps> {
  render() {
    const { match } = this.props;
    const { params: { orgId } } = match;

    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>Groups</h2>

        <p className='gray-text p-b-lg'>
          Your organization has no groups.
        </p>

        <Button className='tertiary uppercase large'>
          Add Group
        </Button>
      </div>
    );
  }
}

export default GroupsRoute;
