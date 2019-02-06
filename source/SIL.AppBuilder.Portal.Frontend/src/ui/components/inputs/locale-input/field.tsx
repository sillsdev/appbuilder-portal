import * as React from 'react';
import Autosuggest from 'react-autosuggest';
import { assert } from '@orbit/utils';

import { withTranslations, i18nProps } from '~/lib/i18n';

import {
  getSuggestions,
  highlightIfPresent,
  findLanguageCode,
  getSuggestionValue,
  sortComparer,
} from './helpers';

export interface IProps {
  value: string; // tag
  onChange: (localeCode: string) => void;
  data: ILanguageInfo[];
}

interface IState {
  value?: string;
  isMatch: boolean;
  suggestions: ILanguageInfo[];
}

class Field extends React.Component<IProps & i18nProps, IState> {
  getSuggestions: (value: string) => ILanguageInfo[];
  findLanguageCode: (value: string) => string;

  constructor(props) {
    super(props);

    assert(`The Locale Picker Field needs a data set. The passed data set is empty.`, props.data);

    this.getSuggestions = getSuggestions(props.data).bind(this);
    this.findLanguageCode = findLanguageCode(props.data);

    const value = this.findLanguageCode(props.value) || '';

    this.state = {
      value,
      suggestions: props.data,
      isMatch: this.doesValueMatchLanguageInfo(value),
    };
  }

  onSuggestionSelected = (event, args) => {
    const { onChange } = this.props;
    const value = args.suggestion.tag;
    const isMatch = this.doesValueMatchLanguageInfo(value);

    this.setState({ value, isMatch }, () => onChange(value));
  };

  doesValueMatchLanguageInfo = (value: string) => {
    const matchingTag = this.findLanguageCode(value);

    return !!matchingTag;
  };

  onChange = (event, { newValue }) => {
    const isMatch = this.doesValueMatchLanguageInfo(newValue);

    this.setState({
      value: newValue,
      isMatch,
    });

    if (newValue === '') {
      this.props.onChange('');
    }
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const { t } = this.props;
    const { value, suggestions, isMatch } = this.state;
    const wrapperClass = `locale-input__${!value || isMatch ? 'has-match' : 'match-missing'}`;

    return (
      <span className={wrapperClass}>
        <Autosuggest
          {...{
            suggestions: suggestions.sort(sortComparer(value)).slice(0, 5),
            // hacking at getSuggestionValue, because the library tries to change
            // the value of the input on highlight.
            getSuggestionValue: () => value,
            inputProps: {
              placeholder: t('locale-picker.placeholder'),
              value,
              onChange: this.onChange,
            },
            renderSuggestion: this.renderSuggestion,
            onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
            onSuggestionSelected: this.onSuggestionSelected,
            onSuggestionsClearRequested: this.onSuggestionsClearRequested,
          }}
        />
      </span>
    );
  }

  renderSuggestion = ({ localname, name, tag, regions, region, names }: ILanguageInfo) => {
    const { t } = this.props;
    const { value } = this.state;

    return (
      <div className='flex-col'>
        <div className='flex-row justify-content-space-between p-b-xs'>
          <div className='flex-col m-b-sm m-r-md'>
            <div className='fs-11 gray-text m-r-sm uppercase'>{t('locale-picker.name')}</div>
            <div className='black-text'>{highlightIfPresent(localname || name, value)}</div>
          </div>
          <div className='flex-col text-align-right'>
            <div className='fs-11 gray-text uppercase'>{t('locale-picker.code')}</div>
            <div className='black-text'>{highlightIfPresent(tag, value)}</div>
          </div>
        </div>
        <div className='flex-row justify-content-space-between'>
          <div className='flex-col m-r-md'>
            <div className='fs-11 gray-text m-r-sm uppercase'>{t('locale-picker.country')}</div>
            <div className='black-text'>{highlightIfPresent(regions || region, value)}</div>
          </div>
          <div className='flex-col text-align-right'>
            <div className='fs-11 gray-text uppercase'>{t('locale-picker.other')}</div>
            <div className='black-text'>{highlightIfPresent((names || []).join(', '), value)}</div>
          </div>
        </div>
      </div>
    );
  };
}

export default withTranslations(Field);
