import * as React from 'react';
import { compose, mapProps } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import * as moment from 'moment';

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
    const { updateFilter, removeFilter } = this.props;

    if (value === 'all') {
      removeFilter({ attribute: 'organization-id' });

      return this.setState({ selectedOrganization: value });
    }

    const id = idFromRecordIdentity({ type: ORGANIZATION, id: value });

    updateFilter({ attribute: 'organization-id', value: id });

    this.setState({ selectedOrganization: value });
  }

  handleToChange = (to?: Date) => {
    const { updateFilter, removeFilter } = this.props;

    if (!to) {
      removeFilter({ attribute: 'project-updated-date', key: 'lt' });
      return this.setState({ to: undefined });
    }

    const endOfDay = moment(to).endOf('day').utc().format();

    updateFilter({ attribute: 'project-updated-date', key: 'lt', value: `le:${endOfDay}` });

    this.setState({ to });
  }

  handleFromChange = (from?: Date) => {
    const { updateFilter, removeFilter } = this.props;

    if (!from) {
      removeFilter({ attribute: 'project-updated-date', key: 'gt' });
      return this.setState({ from: undefined });
    }

    const beginningOfDay = moment(from).startOf('day').utc().format();

    updateFilter({ attribute: 'project-updated-date', key: 'gt', value: `ge:${beginningOfDay}` });

    this.setState({from});
  }

  render() {
    const { organizations, t } = this.props;
    const { from, to, selectedProduct, selectedOrganization } = this.state;


    return (
      <div className='flex-column-xs align-items-end justify-content-space-around flex-row-xl filters'>
        <div className='flex w-100-xs w-50-xl justify-content-center'>
          <div className='input flex-row align-items-center m-l-md m-r-md'>
            <ProductDefinitionSelect
              className='w-100'
              onChange={this.handleProductChange}
              defaultValue={selectedProduct}
            />
          </div>
          <div className='input flex-row align-items-center m-l-md m-r-md'>
            <OrganizationSelect
              className='w-100'
              onChange={this.handleOrganizationChange}
              organizations={organizations}
              defaultValue={selectedOrganization}
            />
          </div>
        </div>

        <div className='
          flex justify-content-center
          w-100-xs w-50-xl p-l-md p-r-md m-t-lg-xs m-t-none-xl
        '>
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

