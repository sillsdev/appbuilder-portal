import * as React from 'react';
import { compose } from 'recompose';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CloseIcon from '@material-ui/icons/Close';

import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';

import { tomorrow } from '@lib/date';
import { withTranslations, i18nProps } from '@lib/i18n';

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
    const compare = (from && from !== '' && from) || maxDate;

    return day < compare || day > maxDate;
  }

  render() {
    const { t, to, from, onToChange, onFromChange, label } = this.props;

    return (
      <div className='flex-column'>
        <div className='dateRange'>{label}</div>
        <div className='flex-row'>
          <div className='input flex-row'>
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
            {from && <CloseIcon onClick={() => onFromChange()} /> }
            {!from && <ArrowDropDownIcon /> }
          </div>

          <div className='input flex-row'>
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
            {to && <CloseIcon onClick={() => onToChange()} /> }
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

