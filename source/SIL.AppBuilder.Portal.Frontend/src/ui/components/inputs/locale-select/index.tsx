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

    i18n.changeLanguage(selection);
    this.props.onChange(selection);
  }

  render() {
    const { value, onChange } = this.props;
    const { default: { options, language } } = i18n;
    const languages = Object.keys(options.resources);
    const selected = value || language;

    return (
      <select
        data-test-locale-switcher
        value={selected} onChange={this.onSelect}>
        { languages.map(locale => (
          <option value={locale}>{locale}</option>
        )) }
      </select>
    );
  }
}
