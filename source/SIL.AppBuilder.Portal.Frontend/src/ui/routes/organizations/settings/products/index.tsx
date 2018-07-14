import * as React from 'react';
import { match as Match } from 'react-router';
import { Checkbox } from 'semantic-ui-react';
import { TYPE_NAME, OrganizationAttributes } from '@data/models/organization';

export const pathName = '/organizations/:orgId/settings/products';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  organization: JSONAPI<OrganizationAttributes>;
}

class ProductsRoute extends React.Component<IProps> {
  togglePrivacy = () => {
    const { update, organization } = this.props;
    const { makePrivateByDefault } = organization.attributes;

    update({ makePrivateByDefault: !makePrivateByDefault });
  }

  render() {
    const { organization } = this.props;
    const { makePrivateByDefault } = organization.attributes;

    return (
      <div className='sub-page-content'>
        <h2 className='bold m-b-xl'>Products and Publishing</h2>

        <div className='flex-row align-items-center p-l-lg p-r-lg m-b-lg'>
          <div>
            <h3>Make Projects Private by Default</h3>
            <p className='input-info'>
              When a new project is created it will be defaulted to Private.
              (Private projects cannot be viewed by anyone outside of your organization)
            </p>
          </div>
          <Checkbox toggle className='m-l-lg'
            checked={makePrivateByDefault}
            onChange={this.togglePrivacy}
            />
        </div>

        <hr />

        <h3 className='p-b-lg'>
          Select all the products you would like to make available to your organization
        </h3>

        TODO: render available products from DWKit as demonstrated
        https://app.zeplin.io/project/5b3b85b95b0fc79a4b3c40c9/screen/5b3b8d851853ea0a2edf9ce0
      </div>
    );
  }
}

export default ProductsRoute;
