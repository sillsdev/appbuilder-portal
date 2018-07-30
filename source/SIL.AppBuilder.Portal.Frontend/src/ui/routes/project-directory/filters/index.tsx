import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Dropdown, Icon } from 'semantic-ui-react';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import MomentLocaleUtils, {
  formatDate,
  parseDate,
} from 'react-day-picker/moment';

import 'react-day-picker/lib/style.css';
import './filters.scss';

interface IState {
  products: any[],
  selectedProduct : string;
  organizations: any[],
  selectedOrganization: string;
  from: any,
  to: any
}

class Filter extends React.Component<i18nProps, IState> {

  constructor(props) {
    super(props);
    this.state = {
      products: [{ text: 'All Products', value: 'all' }, { text: 'Android APK w/ Embedded Audio', value: 'android-apk' }, { text: 'HTML Website', value: 'website'}],
      selectedProduct: null,
      organizations: [{ text: 'All organizations', value: 'all'}, { text: 'SIL International', value: 'SIL'}],
      selectedOrganization: null,
      from: '',
      to: ''
    };

    this.handleProductChange = this.handleProductChange.bind(this);
    this.handleOrganizationChange = this.handleOrganizationChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);
    this.handleFromChange = this.handleFromChange.bind(this);
    this.disableFrom = this.disableFrom.bind(this);
    this.disableTo = this.disableTo.bind(this);
  }

  handleProductChange(e) {
    this.setState({ selectedProduct: e.target.value });
  }

  handleOrganizationChange(e) {
    this.setState({ selectedOrganization: e.target.value });
  }

  handleToChange(to) {
    this.setState({ to });
  }

  handleFromChange (from) {
    this.setState({from});
  }

  disableFrom(day) {

    const { to } = this.state;
    return day > (new Date()) || (to !== '' && day > to);
  }

  disableTo(day) {

    const { from } = this.state;
    return day > (new Date()) || (from !== '' && day < from);
  }

  render() {

    const today = new Date();

    const { t } = this.props;
    const { from, to } = this.state;

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
              options={this.state.organizations}
              defaultValue={this.state.organizations[0].value} />
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
  translate('translations')
)(Filter);

