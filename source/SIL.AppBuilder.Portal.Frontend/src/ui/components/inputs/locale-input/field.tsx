import * as React from 'react';
import Autosuggest from 'react-autosuggest';
import { assert } from '@orbit/utils';

const getSuggestions = (data: ILanguageTag[]) => (value) => {
  const inputValue = (value || '').trim().toLowerCase();

  if (inputValue.length < 3) {
    return [];
  }

  const has = (property: string) => (property || '').toLowerCase().includes(inputValue);

  return data.filter(
    ({ full, iso639_3: iso, name, region, tag }) =>
      has(full) || has(iso) || has(name) || has(region) || has(tag)
  );
};

function findLanguageCode(data: ILanguageTag[]) {
  return (value: string) => {
    const tag = data.find((lang) => lang.iso639_3 === value);

    return tag.iso639_3 || '';
  };
}

const getSuggestionValue = (suggestion: ILanguageTag) => suggestion.iso639_3;

// Use your imagination to render suggestions.
const renderSuggestion = (suggestion: ILanguageTag) => (
  <div className='flex-col'>
    <div className='flex-row justify-content-space-between p-b-xs'>
      <span>{suggestion.name}</span>
      <em>{suggestion.iso639_3}</em>
    </div>
    <div className='flex-row'>
      <strong>{suggestion.full}</strong>
    </div>
  </div>
);

export interface IProps {
  value: string; // iso639_3
  onChange: (localeCode: string) => void;
  data: ILanguageTag[];
}

interface IState {
  value?: string;
  suggestions: ILanguageTag[];
}

export default class Field extends React.Component<IProps, IState> {
  getSuggestions: (value: string) => ILanguageTag[];

  constructor(props) {
    super(props);

    assert(`The Locale Picker Field needs a data set. The passed data set is empty.`, props.data);

    this.state = {
      value: findLanguageCode(props.data)(props.value) || 'eng',
      suggestions: props.data,
    };

    this.getSuggestions = getSuggestions(props.data).bind(this);
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Type at least 3 letters',
      value,
      onChange: this.onChange,
    };
    console.log(value, suggestions);

    // Finally, render it!
    return (
      <Autosuggest
        {...{
          suggestions,
          getSuggestionValue,
          renderSuggestion,
          inputProps,
          onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
          onSuggestionsClearRequested: this.onSuggestionsClearRequested,
        }}
      />
    );
  }
}
