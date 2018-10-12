import * as React from 'react';
import { compose, mapProps } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';

import { OrganizationResource, idFromRecordIdentity } from '@data';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { IFilter, IFilterProps } from '@data/containers/api/with-filtering';
import {
  withCurrentOrganization,
  IProvidedProps as ICurrentOrgProps
} from '@data/containers/with-current-organization';

import OrganizationSelect from '@ui/components/inputs/organization-select/display';
import ProductDefinitionSelect from '@ui/components/inputs/product-definition-select';
import DateRange from '@ui/components/inputs/date-range';

import 'react-day-picker/lib/style.css';
import './filters.scss';

interface IState {
  selectedProduct : string;
  selectedOrganization: string;
  from: any;
  to: any;
}

interface IOwnProps {
  organizations: OrganizationResource[];
}

type IProps =
& ICurrentOrgProps
& IOwnProps
& IFilterProps
& i18nProps;

class Filter extends React.Component<IProps, IState> {
  state = {
    selectedProduct: 'all',
    selectedOrganization: 'all',
    from: '',
    to: ''
  };

  handleProductChange = (value) => {
    const { updateFilter, removeFilter } = this.props;

    if (value === 'all') {
      removeFilter({ attribute: 'any-product-definition-id' });
    } else {
      const id = idFromRecordIdentity({ type: 'productDefinition', id: value });

      updateFilter({ attribute: 'any-product-definition-id', value: id });
    }


    this.setState({ selectedProduct: value });
  }

  handleOrganizationChange = (value) => {
    const { updateFilter } = this.props;

    if (value === 'all') {
      updateFilter({ attribute: 'organization-header', value });

      return this.setState({ selectedOrganization: value });
    }

    const id = idFromRecordIdentity({ type: ORGANIZATION, id: value });

    updateFilter({ attribute: 'organization-header', value: id });

    this.setState({ selectedOrganization: value });
  }

  handleToChange = (to?: Date) => {
    const { updateFilter, removeFilter } = this.props;

    if (!to) {
      removeFilter({ attribute: 'product-updated-date' });
      return this.setState({ to: undefined });
    }

    const normalizedTo = to.toISOString();

    updateFilter({ attribute: 'product-updated-date', value: `le:${normalizedTo}` });

    this.setState({ to });
  }

  handleFromChange = (from?: Date) => {
    const { updateFilter, removeFilter } = this.props;

    if (!from) {
      removeFilter({ attribute: 'product-updated-date' });
      return this.setState({ from: undefined });
    }

    const normalizedFrom = from.toISOString();

    updateFilter({ attribute: 'product-updated-date', value: `ge:${normalizedFrom}` });

    this.setState({from});
  }

  render() {
    const { organizations, t } = this.props;
    const { from, to, selectedProduct, selectedOrganization } = this.state;


    return (
      <div className='flex-column-xs justify-content-space-around flex-row-lg filters'>
        <div className='flex w-50'>
          <div className='input m-r-30'>
            <ProductDefinitionSelect
              className='w-100'
              onChange={this.handleProductChange}
              defaultValue={selectedProduct}
            />
          </div>
          <div className='input'>
            <OrganizationSelect
              className='w-100'
              onChange={this.handleOrganizationChange}
              organizations={organizations}
              defaultValue={selectedOrganization}
            />
          </div>
        </div>

        <div className='flex w-50'>
          <DateRange
            label={t('directory.filters.dateRange')}
            to={to}
            from={from}
            onToChange={this.handleToChange}
            onFromChange={this.handleFromChange}
          />
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withCurrentOrganization,
)(Filter);

