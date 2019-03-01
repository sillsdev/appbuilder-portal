import * as React from 'react';
import { compose } from 'recompose';
import { Dropdown } from 'semantic-ui-react';
import { WithDataProps } from 'react-orbitjs';
import { withTranslations, i18nProps } from '@lib/i18n';
import { attributesFor } from '@data/helpers';
import { UserAttributes } from '@data/models/user';
import { ResourceObject } from 'jsonapi-typescript';

import { USERS_TYPE, update } from '@data';

import { withCurrentUserContext } from '@data/containers/with-current-user';

export interface IOwnProps {
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  onChange: (locale: string) => void;
  className?: string;
}

type IProps = IOwnProps & WithDataProps & i18nProps;

interface IState {
  firstTime: boolean;
}

const translationMap = { 'en-US': 'en', 'es-419': 'es', 'fr-FR': 'fr' };

class LocaleSelect extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      firstTime: true,
    };
  }

  onSelect = async (e, { value }) => {
    e.preventDefault();

    const { onChange, selected } = this.props;

    if (value === selected) {
      return;
    }

    onChange(value);
  };

  render() {
    const { currentUser, i18n, onChange } = this.props;
    const { firstTime } = this.state;
    const attributes = attributesFor(currentUser) as UserAttributes;
    const userLocale = attributes.locale;
    const { options, language } = i18n;
    const languages = Object.keys(options.resources);
    const defaultLocale = userLocale || language;
    if (firstTime) {
      this.setState({ firstTime: false });
      onChange(defaultLocale);
    }
    const languageOptions = languages.map((locale) => ({
      text: translationMap[locale],
      value: locale,
    }));

    return (
      <Dropdown
        data-test-locale-selector
        inline
        options={languageOptions}
        defaultValue={defaultLocale}
        onChange={this.onSelect}
      />
    );
  }
}

export default compose(
  withTranslations,
  withCurrentUserContext
)(LocaleSelect);
