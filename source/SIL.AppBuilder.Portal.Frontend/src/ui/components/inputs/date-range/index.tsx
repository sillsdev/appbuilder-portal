import * as React from 'react';
import { compose } from 'recompose';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import { withTranslations, i18nProps } from '@lib/i18n';

import {
  formatDate,
  parseDate,
} from 'react-day-picker/moment';

import 'react-day-picker/lib/style.css';

function tomorrow() {
  const d = new Date();

  d.setDate(d.getDate() + 1);

  return d;
}

interface IOwnProps {
  onToChange: (value: Date) => void;
  onFromChange: (value: Date) => void;
  to: Date | string;
  from: Date | string;
}

class DateRange extends React.Component<IOwnProps & i18nProps> {
  disableFrom = (day: Date) => {
    const { to } = this.props;
    const compare = (to && to !== '' && to) || new Date();

    return day > compare;
  }

  disableTo = (day: Date) => {
    const { from } = this.props;
    const maxDate = tomorrow();
    const compare = (from && from !== '' && from) || maxDate;

    return day < compare || day > maxDate;
  }

  render() {
    const { t, to, from, onToChange, onFromChange } = this.props;

    return (
      <>
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
            onDayChange={onFromChange}
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
            onDayChange={onToChange}
            placeholder=''
            formatDate={formatDate}
            parseDate={parseDate}
            value={to}
          />
        </div>
      </>
    );
  }
}

export default compose(
  withTranslations
)(DateRange);

