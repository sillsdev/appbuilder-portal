import * as React from 'react';
import { compose } from 'recompose';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';

import { tomorrow } from '@lib/date';
import { withTranslations, i18nProps } from '@lib/i18n';

import Cancel from './close-icon';

import 'react-day-picker/lib/style.css';
import './styles.scss';

interface IOwnProps {
  label: string;
  onToChange: (value?: Date) => void;
  onFromChange: (value?: Date) => void;
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
    const compare = (from && from !== '' && from);

    if (!compare) {
      return day > maxDate;
    }

    return day < compare || day > maxDate;
  }

  // NOTE: the onDayChange handler only gets invoked with a valid date
  // TODO: figure out how to have the internal validation
  //       trigger a visual error state / color
  render() {
    const { t, to, from, onToChange, onFromChange, label } = this.props;

    return (
      <div
        data-test-range-input
        className='flex-column date-range-input-with-label'>
        <div className='dateRange'>{label}</div>
        <div className='flex-row'>
          <div data-test-range-from className='input flex-row m-r-md'>
            <DayPickerInput
              locale='en'
              value={from}
              dayPickerProps={{
                disabledDays: this.disableFrom,
                showOutsideDays: true,
              }}
              onDayChange={onFromChange}
              placeholder=''
              formatDate={formatDate}
              parseDate={parseDate}
            />
            {from && <Cancel className='w-lg' data-test-clear-from onClick={() => onFromChange()} /> }
            {!from && <ArrowDropDownIcon /> }
          </div>

          <div data-test-range-to className='input flex-row m-l-md'>
            <DayPickerInput
              locale='en'
              dayPickerProps={{
                disabledDays: this.disableTo,
                showOutsideDays: true,
              }}
              onDayChange={onToChange}
              placeholder=''
              formatDate={formatDate}
              parseDate={parseDate}
              value={to}
            />
            {to && <Cancel className='w-lg' data-test-clear-to onClick={() => onToChange()} /> }
            {!to && <ArrowDropDownIcon /> }
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations
)(DateRange);

