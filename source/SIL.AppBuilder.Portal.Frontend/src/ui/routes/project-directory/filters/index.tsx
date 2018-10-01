import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Dropdown } from 'semantic-ui-react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import MomentLocaleUtils, {
  formatDate,
  parseDate,
} from 'react-day-picker/moment';

import { attributesFor, OrganizationResource, idFromRecordIdentity } from '@data';
import { OrganizationAttributes, TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { IFilter } from '@data/containers/api/with-filtering';
import {
  withCurrentOrganization,
  IProvidedProps as ICurrentOrgProps
} from '@data/containers/with-current-organization';

import OrganizationSelect from '@ui/components/inputs/organization-select/display';

import 'react-day-picker/lib/style.css';
import './filters.scss';
import { ResourceObject } from 'jsonapi-typescript';

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

  handleToChange = (to) => {
    const { updateFilter } = this.props;

    updateFilter({ attribute: 'products.dateUpdated', value: `le:${to}` });

    this.setState({ to });
  }

  handleFromChange = (from) => {
    const { updateFilter } = this.props;

    updateFilter({ attribute: 'products.dateUpdated', value: `ge:${from}` });

    this.setState({from});
  }

  disableFrom = (day) => {
    const { to } = this.state;
    const compare = (to && to !== '' && to) || new Date();

    return day > compare;
  }

  disableTo = (day) => {
    const { from } = this.state;
    const compare = (from && from !== '' && from) || new Date();

    return day < compare;
  }

  render() {
    const { t, organizations } = this.props;
    const { from, to, products, selectedProduct, selectedOrganization } = this.state;

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
          <div className='input m-r-30'>
            <div className='dateRange'>{t('directory.filters.dateRange')}</div>
            <ArrowDropDownIcon/>
            <DayPickerInput
              locale='en'
              value={from}
              dayPickerProps={{
                disabledDays: this.disableFrom,
                showOutsideDays: true
              }}
              onDayChange={this.handleFromChange}
              placeholder=''
              formatDate={formatDate}
              parseDate={parseDate}
            />
          </div>
          <div className='input'>
            <ArrowDropDownIcon />
            <DayPickerInput
              locale='en'
              dayPickerProps={{
                disabledDays: this.disableTo,
                showOutsideDays: true
              }}
              onDayChange={this.handleToChange}
              placeholder=''
              formatDate={formatDate}
              parseDate={parseDate}
              value={to}

            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  translate('translations'),
  withCurrentOrganization
)(Filter);

