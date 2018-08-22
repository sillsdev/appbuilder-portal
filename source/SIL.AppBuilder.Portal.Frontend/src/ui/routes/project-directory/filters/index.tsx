import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Dropdown, Icon } from 'semantic-ui-react';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import MomentLocaleUtils, {
  formatDate,
  parseDate,
} from 'react-day-picker/moment';

import { OrganizationAttributes } from '@data/models/organization';
import { IFilter } from '@data/containers/with-filtering';
import {
  withCurrentOrganization,
  IProvidedProps as ICurrentOrgProps
} from '@data/containers/with-current-organization';

import { attributesFor } from '@data';

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
  organizations: Array<JSONAPI<OrganizationAttributes>>;
  onOrganizationChange: (id: string | number) => void;
}

type IProps =
& ICurrentOrgProps
& IOwnProps
& i18nProps;

class Filter extends React.Component<IProps, IState> {
  state = {
    products: [{ text: 'All Products', value: 'all' }, { text: 'Android APK w/ Embedded Audio', value: 'android-apk' }, { text: 'HTML Website', value: 'website'}],
    selectedProduct: null,
    selectedOrganization: null,
    from: '',
    to: ''
  };

  handleProductChange = (e, { value }) => {
    this.props.updateFilter({ attribute: 'products.productDefinition.name', value });

    this.setState({ selectedProduct: value });
  }

  handleOrganizationChange = (e, { value }) => {
    const { onOrganizationChange } = this.props;

    onOrganizationChange(value);
  }

  handleToChange = (to) => {
    this.props.updateFilter({ attribute: 'products.dateUpdated', value: to });

    this.setState({ to });
  }

  handleFromChange = (from) => {
    this.props.updateFilter({ attribute: 'products.dateUpdated', value: from });

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

    const { t, organizations, currentOrganizationId } = this.props;
    const { from, to } = this.state;
    const organizationOptions = [{ text: 'All Organizations', value: ''}].concat(
      organizations.map(o => ({
        text: attributesFor(o).name || '',
        value: o.id
      }))
    );

    return (
      <div className='flex filters'>
        <div className='flex w-50'>
          <div className='input m-r-30'>
            <Dropdown
              className='w-100'
              options={this.state.products}
              onChange={this.handleProductChange}
              defaultValue={this.state.products[0].value} />
          </div>
          <div className='input'>
            <Dropdown
              className='w-100'
              onChange={this.handleOrganizationChange}
              options={organizationOptions}
              defaultValue={currentOrganizationId} />
          </div>
        </div>

        <div className='flex justify-content-end w-50'>
          <div className='input m-r-30'>
            <div className='dateRange'>{t('directory.filters.dateRange')}</div>
            <Icon name='dropdown' />
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
            <Icon name='dropdown' />
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

