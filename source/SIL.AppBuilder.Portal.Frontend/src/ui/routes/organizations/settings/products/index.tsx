import * as React from 'react';
import { match as Match } from 'react-router';
import { Checkbox } from 'semantic-ui-react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { OrganizationAttributes } from '@data/models/organization';

import {
  OrganizationResource,
  OrganizationProductDefinitionResource,
  ProductDefinitionResource,
  attributesFor,
} from '@data';

import ProductDefinitionMultiSelect from '@ui/components/inputs/product-definition-multi-select';
import { withTranslations, i18nProps } from '@lib/i18n';

export const pathName = '/organizations/:orgId/settings/products';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  updateOrganization: (payload: OrganizationAttributes) => void;
  updateProductDefinition: (payload: ProductDefinitionResource) => void;
  organization: OrganizationResource;
  organizationProductDefinitions: OrganizationProductDefinitionResource[];
}

type IOwnProps = IProps & i18nProps;

class ProductsRoute extends React.Component<IOwnProps> {
  togglePrivacy = () => {
    const { updateOrganization, organization } = this.props;
    const { publicByDefault } = attributesFor(organization);

    updateOrganization({ publicByDefault: !publicByDefault });
  };

  updateProductDefinition = (productDefinition) => {
    const { updateProductDefinition } = this.props;

    updateProductDefinition(productDefinition);
  };

  render() {
    const { organization, organizationProductDefinitions, t } = this.props;
    const { publicByDefault } = attributesFor(organization);

    const multiSelectProps = {
      selected: organizationProductDefinitions,
      onChange: this.updateProductDefinition,
    };

    return (
      <div className='sub-page-content' data-test-org-settings-products>
        <h2 className='bold m-b-md'>{t('org.productsTitle')}</h2>

        <div className='flex-row align-items-center p-l-sm p-r-sm m-b-lg'>
          <div>
            <h3>{t('org.makePrivateTitle')}</h3>
            <p className='input-info'>{t('org.makePrivateDescription')}</p>
          </div>
          <Checkbox
            toggle
            className='m-l-lg'
            checked={publicByDefault}
            onChange={this.togglePrivacy}
          />
        </div>

        <hr />

        <h3 className='p-b-md'>{t('org.productSelectTitle')}</h3>
        <ProductDefinitionMultiSelect {...multiSelectProps} />
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit(({ organization }) => ({
    organizationProductDefinitions: (q) =>
      q.findRelatedRecords(organization, 'organizationProductDefinitions'),
  }))
)(ProductsRoute);
