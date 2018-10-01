import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { Dropdown } from 'semantic-ui-react';

import { OrganizationResource, idFromRecordIdentity } from '@data';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { IFilter } from '@data/containers/api/with-filtering';
import {
  withCurrentOrganization,
  IProvidedProps as ICurrentOrgProps
} from '@data/containers/with-current-organization';

import OrganizationSelect from '@ui/components/inputs/organization-select/display';
import DateRange from '@ui/components/inputs/date-range';

import 'react-day-picker/lib/style.css';
import './filters.scss';

interface IState {
  products: any[];
  selectedProduct : string;
  selectedOrganization: string;
  from: any;
  to: any;
}

interface IOwnProps {
  updateFilter: (filter: IFilter) => void;
  organizations: OrganizationResource[];
}

type IProps =
& ICurrentOrgProps
& IOwnProps
& i18nProps;

class Filter extends React.Component<IProps, IState> {
  state = {
    products: [
      { text: 'All Products', value: 'all' },
      { text: 'Android APK w/ Embedded Audio', value: 'android-apk' },
      { text: 'HTML Website', value: 'website'}],
    selectedProduct: 'all',
    selectedOrganization: 'all',
    from: '',
    to: ''
  };

  handleProductChange = (e, { value }) => {
    const { updateFilter } = this.props;

    updateFilter({ attribute: 'any-product-name', value });

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

  handleToChange = (to: Date) => {
    const { updateFilter } = this.props;
    const normalizedTo = to.toISOString();

    updateFilter({ attribute: 'product-updated-date', value: `le:${normalizedTo}` });

    this.setState({ to });
  }

  handleFromChange = (from: Date) => {
    const { updateFilter } = this.props;
    const normalizedFrom = from.toISOString();

    updateFilter({ attribute: 'product-updated-date', value: `ge:${normalizedFrom}` });

    this.setState({from});
  }

  render() {
    const { organizations } = this.props;
    const { from, to, selectedProduct, selectedOrganization } = this.state;

    return (
      <div className='flex filters'>
        <div className='flex w-50'>
          <div className='input m-r-30'>
            <Dropdown
              className='w-100'
              options={this.state.products}
              onChange={this.handleProductChange}
              defaultValue={selectedProduct} />
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

        <div className='flex justify-content-end w-50'>
          <DateRange
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
  withCurrentOrganization
)(Filter);

