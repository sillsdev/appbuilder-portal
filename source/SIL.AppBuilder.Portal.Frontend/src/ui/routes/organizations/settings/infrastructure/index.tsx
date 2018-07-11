import * as React from 'react';
import { match as Match } from 'react-router';
import { Checkbox } from 'semantic-ui-react';
import { OrganizationAttributes } from '@data/models/organization';

export const pathName = '/organizations/:orgId/settings/infrastructure';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  organization: JSONAPI<OrganizationAttributes>;
}

class InfrastructureRoute extends React.Component<IProps> {
  toggleUseSIL = () => {
    const { update, organization } = this.props;
    const { useSilBuildInfrastructure } = organization.attributes;

    update({ useSilBuildInfrastructure: !useSilBuildInfrastructure });
  }

  render() {
    const { organization } = this.props;
    const { useSilBuildInfrastructure } = organization.attributes;


    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>Infrastructure</h2>

        <div className='flex-row align-items-center p-l-lg p-r-lg m-b-lg'>
          <div>
            <h3>Make Projects Private by Default</h3>
            <p className='input-info'>
              When a new project is created it will be defaulted to Private.
              (Private projects cannot be viewed by anyone outside of your organization)
            </p>
          </div>
          <Checkbox toggle className='m-l-lg'
            checked={useSilBuildInfrastructure}
            onChange={this.toggleUseSIL}
            />
        </div>
      </div>
    );
  }
}

export default InfrastructureRoute;
