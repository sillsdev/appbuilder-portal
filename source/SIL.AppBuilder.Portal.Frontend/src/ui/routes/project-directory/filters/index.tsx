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
  organizations: any[]
}

class Filter extends React.Component<i18nProps, IState> {

  constructor(props) {
    super(props);
    this.state = {
      products: [{ text: 'All Products', value: 'all' }, { text: 'Android APK w/ Embedded Audio', value: 'android-apk' }, { text: 'HTML Website', value: 'website'}],
      organizations: [{ text: 'All organizations', value: 'all'}, { text: 'SIL International', value: 'SIL'}]
    }
  }

  render() {

    const { t } = this.props;

    return (
      <div className='flex filters'>
        <div className='flex w-50'>
          <div className='input m-r-30'>
            <Dropdown
              className='w-100'
              options={this.state.products}
              defaultValue={this.state.products[0].value} />
          </div>
          <div className='input'>
            <Dropdown
              className='w-100'
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
              showOutsideDays
              placeholder=''
              formatDate={formatDate}
              parseDate={parseDate}
            />
          </div>
          <div className='input'>
            <Icon name='dropdown' />
            <DayPickerInput
              locale='en'
              showOutsideDays
              placeholder=''
              formatDate={formatDate}
              parseDate={parseDate}
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

