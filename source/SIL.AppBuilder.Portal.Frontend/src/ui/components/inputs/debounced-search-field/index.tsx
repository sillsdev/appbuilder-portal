import * as React from 'react';
import SearchIcon from '@material-ui/icons/Search';

import { debounce } from '@lib/debounce';
import { filterForValidAttributes, IAttributeProps } from '@lib/dom';

import './styles.scss';

export interface IProps {
  onSubmit: (term: string) => void;
  placeholder?: string;
}

interface IState {
  searchTerm: string;
}

export default class DebouncedSearch extends React.Component<IProps & IAttributeProps, IState> {
  state = { searchTerm: '' };

  trySearch = debounce(() => {
    const { searchTerm } = this.state;

    this.props.onSubmit(searchTerm);
  }, 250);

  didType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;

    this.setState({ searchTerm }, this.trySearch);
  }

  render() {
    const { placeholder, className, ...other } = this.props;
    const { searchTerm } = this.state;

    const attributes = filterForValidAttributes(other);

    return (
      <div className={`ui left input icon ${className}`} { ...attributes }>
        <input
          type='text'
          placeholder={placeholder}
          value={searchTerm}
          onChange={this.didType} />
        <SearchIcon className='material-search-icon-in-field' />
      </div>
    );
  }

}
