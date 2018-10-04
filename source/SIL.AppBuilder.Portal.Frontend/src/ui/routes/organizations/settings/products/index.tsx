import * as React from 'react';
import { match as Match } from 'react-router';
import { Checkbox } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

import { OrganizationAttributes } from '@data/models/organization';
import { OrganizationResource } from '@data';
import ProductDefinitionMultiSelect from '@ui/components/inputs/product-definition-multi-select';

export const pathName = '/organizations/:orgId/settings/products';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  organization: OrganizationResource;
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

    const makePublicByDefault = !makePrivateByDefault;

    return (
      <div className='sub-page-content'>
        <h2 className='bold m-b-md'>{t('org.productsTitle')}</h2>

        <div className='flex-row align-items-center p-l-sm p-r-sm m-b-lg'>
          <div>
            <h3>{t('org.makePrivateTitle')}</h3>
            <p className='input-info'>{t('org.makePrivateDescription')}</p>
          </div>
          <Checkbox toggle className='m-l-lg'
            checked={makePublicByDefault}
            onChange={this.togglePrivacy}
            />
        </div>

        <hr />

        <h3 className='p-b-md'>{t('org.productSelectTitle')}</h3>
        <ProductDefinitionMultiSelect/>
      </div>
    );
  }
}

export default compose(
  translate('translations')
)(ProductsRoute);
