import * as React from 'react';
import Autosuggest from 'react-autosuggest';
import { assert } from '@orbit/utils';

import { withTranslations, i18nProps, useLdml } from '~/lib/i18n';

import { getSuggestions, findLanguageCode, sortComparer } from './-utils/helpers';

import { localizeTagData } from './-utils/localize';
import { Suggestion } from './suggestion';
import { measureTime } from '~/lib/debug';

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

    // TODO: re-calc this if the user changes their language
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
      <span data-test-locale-input-container className={wrapperClass}>
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

const LocaleInputField = React.memo((props: IProps) => {
  const { t, i18n } = useLdml();
  // TODO: need a way to cache localizeTagData
  let data = measureTime('localizeTagData', () => localizeTagData(props.data, t))();

  return <FieldDisplay {...{ ...props, data }} />;
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});

export default LocaleInputField;
