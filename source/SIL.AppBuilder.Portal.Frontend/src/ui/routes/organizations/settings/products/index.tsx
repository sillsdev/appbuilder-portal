import * as React from 'react';
import { match as Match } from 'react-router';
import { Checkbox } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

import { TYPE_NAME, OrganizationAttributes } from '@data/models/organization';
import { ORGANIZATIONS_TYPE } from '@data';
import { ResourceObject } from 'jsonapi-typescript';

export const pathName = '/organizations/:orgId/settings/products';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

class ProductsRoute extends React.Component<IProps & i18nProps> {
  togglePrivacy = () => {
    const { update, organization } = this.props;
    const { makePrivateByDefault } = organization.attributes;

    update({ makePrivateByDefault: !makePrivateByDefault });
  }

  render() {
    const { organization, t } = this.props;
    const { makePrivateByDefault } = organization.attributes;

    return (
      <div className='sub-page-content'>
        <h2 className='bold m-b-xl'>{t('org.productsTitle')}</h2>

        <div className='flex-row align-items-center p-l-lg p-r-lg m-b-lg'>
          <div>
            <h3>{t('org.makePrivateTitle')}</h3>
            <p className='input-info'>{t('org.makePrivateDescription')}</p>
          </div>
          <Checkbox toggle className='m-l-lg'
            checked={makePrivateByDefault}
            onChange={this.togglePrivacy}
            />
        </div>

        <hr />

        <h3 className='p-b-lg'>{t('org.productSelectTitle')}</h3>

        <p style={{ width: '200px', overflow: 'auto'}}>
          TODO: render available products from DWKit as demonstrated
          https://app.zeplin.io/project/5b3b85b95b0fc79a4b3c40c9/screen/5b3b8d851853ea0a2edf9ce0
        </p>
      </div>
    );
  }
}

export default compose(
  translate('translations')
)(ProductsRoute);
