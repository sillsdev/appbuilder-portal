import * as React from 'react';
import Autosuggest from 'react-autosuggest';
import { assert } from '@orbit/utils';

import {
  getSuggestions,
  highlightIfPresent,
  findLanguageCode,
  getSuggestionValue,
  sortComparer,
} from './helpers';

// Use your imagination to render suggestions.

export interface IProps {
  value: string; // tag
  onChange: (localeCode: string) => void;
  data: ILanguageInfo[];
}

interface IState {
  value?: string;
  suggestions: ILanguageInfo[];
}

export default class Field extends React.Component<IProps, IState> {
  getSuggestions: (value: string) => ILanguageInfo[];

  constructor(props) {
    super(props);

    assert(`The Locale Picker Field needs a data set. The passed data set is empty.`, props.data);

    this.state = {
      value: findLanguageCode(props.data)(props.value) || 'en',
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

  renderSuggestion = ({ localname, name, tag, regions, region, names }: ILanguageInfo) => {
    const { value } = this.state;

    return (
      <div className='flex-col'>
        <div className='flex-row justify-content-space-between p-b-xs'>
          <div className='flex-col m-b-sm m-r-md'>
            <div className='fs-11 gray-text m-r-sm uppercase'>Name</div>
            <div className='black-text'>{highlightIfPresent(localname || name, value)}</div>
          </div>
          <div className='flex-col text-align-right'>
            <div className='fs-11 gray-text uppercase'>Code</div>
            <div className='black-text'>{highlightIfPresent(tag, value)}</div>
          </div>
        </div>
        <div className='flex-row justify-content-space-between'>
          <div className='flex-col m-r-md'>
            <div className='fs-11 gray-text m-r-sm uppercase'>Country</div>
            <div className='black-text'>{highlightIfPresent(regions || region, value)}</div>
          </div>
          <div className='flex-col text-align-right'>
            <div className='fs-11 gray-text uppercase'>Other Names</div>
            <div className='black-text'>{highlightIfPresent((names || []).join(', '), value)}</div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Type at least 2 letters',
      value,
      onChange: this.onChange,
    };

    // Finally, render it!
    return (
      <Autosuggest
        {...{
          suggestions: suggestions.sort(sortComparer(value)).slice(0, 5),
          getSuggestionValue,
          inputProps,
          renderSuggestion: this.renderSuggestion,
          onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
          onSuggestionsClearRequested: this.onSuggestionsClearRequested,
        }}
      />
    );
  }
}
