import * as React from 'react';
import { useMemo, memo } from 'react';
import Autosuggest from 'react-autosuggest';
import { assert } from '@orbit/utils';

import { withTranslations, i18nProps, useLdml } from '~/lib/i18n';

import { filterForValidAttributes } from '~/lib/dom';

import { getSuggestions, findLanguageCode, sortComparer, findLanguageInfo } from './-utils/helpers';
import { localizeTagData } from './-utils/localize';
import { Suggestion } from './suggestion';

export interface IProps {
  value: string; // tag
  onChange: (localeCode: string) => void;
  data: ILanguageInfo[];
}

interface IState {
  value?: string;
  isMatch: boolean;
  suggestions: ILanguageInfo[];
  languageInfo: ILanguageInfo;
}

class Field extends React.Component<IProps & i18nProps, IState> {
  getSuggestions: (value: string) => ILanguageInfo[];
  findLanguageCode: (value: string) => string;
  findLanguageInfo: (value: string) => ILanguageInfo;

  constructor(props) {
    super(props);

    assert(`The Locale Picker Field needs a data set. The passed data set is empty.`, props.data);

    this.getSuggestions = getSuggestions(props.data).bind(this);
    this.findLanguageCode = findLanguageCode(props.data);
    this.findLanguageInfo = findLanguageInfo(props.data);

    const value = this.findLanguageCode(props.value) || '';
    const matchData = this.languageInfoMatchingValue(value);

    this.state = {
      value,
      suggestions: props.data,
      ...matchData,
    };
  }

  onSuggestionSelected = (event, args) => {
    const { onChange } = this.props;
    const value = args.suggestion.tag;
    const matchData = this.languageInfoMatchingValue(value);

    this.setState({ value, ...matchData }, () => onChange(value));
  };

  languageInfoMatchingValue = (
    value: string
  ): { isMatch: boolean; languageInfo: ILanguageInfo } => {
    const matchingTag = this.findLanguageInfo(value);

    return { isMatch: !!matchingTag, languageInfo: matchingTag };
  };

  onChange = (event, { newValue }) => {
    const matchData = this.languageInfoMatchingValue(newValue);

    this.setState({
      value: newValue,
      ...matchData,
    });

    // TODO: Do we want to have a condition passed in that requires
    // a match?
    // if (newValue === '') {
    //   this.props.onChange('');
    // }

    this.props.onChange(newValue);
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
    const { value, suggestions, isMatch, languageInfo } = this.state;
    const wrapperClass = `locale-input__${!value || isMatch ? 'has-match' : 'match-missing'}`;

    const domAttributes = filterForValidAttributes(this.props);

    return (
      <span data-test-locale-input-container className={wrapperClass} {...domAttributes}>
        <div className='locale-input__full-tag'>{languageInfo && languageInfo.full}</div>
        <Autosuggest
          {...{
            suggestions: suggestions.sort(sortComparer(value)).slice(0, 5),
            // hacking at getSuggestionValue, because the library tries to change
            // the value of the input on highlight.
            getSuggestionValue: () => value,
            inputProps: {
              'data-test-language': true,
              'data-test-value-from-props': this.props.value,
              placeholder: t('locale-picker.placeholder'),
              value,
              onChange: this.onChange,
            },
            renderSuggestion: (suggestion) => Suggestion({ suggestion, searchedValue: value, t }),
            onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
            onSuggestionSelected: this.onSuggestionSelected,
            onSuggestionsClearRequested: this.onSuggestionsClearRequested,
          }}
        />
      </span>
    );
  }
}
const FieldDisplay = withTranslations(Field);

const LocaleInputField = memo(
  (props: IProps) => {
    const { t, i18n } = useLdml();
    const data = useMemo(() => localizeTagData(props.data, t), [i18n.language]);

    return <FieldDisplay {...{ ...props, data }} />;
  },
  (prev, next) => prev.value === next.value
);

export default LocaleInputField;
