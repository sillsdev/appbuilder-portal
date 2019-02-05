import * as React from 'react';
import { RectLoader } from '@ui/components/loaders';

import LocaleInputField from './field';

// async function getLanguages() {
//   return await import(/* webpackChunkName: "alltags.json" */ '~/public/assets/language/alltags.json');
// }

export interface IProps {
  value?: string;
  onChange: (localeCode: string) => void;
}

interface IState {
  data?: ILanguageTag[];
}
export default class extends React.Component<IProps, IState> {
  loading = true;
  state: IState = {};

  componentDidMount() {
    this.fetchLanguageData();
  }

  async fetchLanguageData() {
    const response = await fetch('/assets/language/alltags.json');
    const data = await response.json();

    this.loading = false;
    this.setState({ data });
  }

  render() {
    const { value, onChange } = this.props;
    const { data } = this.state;

    if (this.loading) {
      return (
        <div>
          <RectLoader />
        </div>
      );
    }

    return <LocaleInputField {...{ value, onChange, data }} />;
  }
}
