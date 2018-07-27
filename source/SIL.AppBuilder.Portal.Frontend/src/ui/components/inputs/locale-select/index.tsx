import * as React from "react";
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import i18n from '@ui/../translations';

export interface IProps {
  value: string;
  onChange: () => void;
  className?: string;
}

@withTemplateHelpers
export default class LocaleSelect extends React.Component {
  mut: Mut;

  constructor(props = {}) {
    super(props);

    this.state = { value: props.value };
  }

  onSelect = (e) => {
    const selection = e.target.value;
  console.log(selection);
    i18n.changeLanguage(selection);

    this.props.onChange(selection);
  }

  render() {
    const { value, onChange } = this.props;
    const { default: { languages } } = i18n;

    return (
      <select selected={value} onChange={this.onSelect}>
        <option value='whatever'>aoeu</option>
        { languages.map(locale => (
          <option value={locale}>{locale}</option>
        )) }
      </select>
    );
  }
}
