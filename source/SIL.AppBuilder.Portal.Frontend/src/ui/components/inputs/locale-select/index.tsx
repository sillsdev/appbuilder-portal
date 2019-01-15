import * as React from "react";
import { compose } from 'recompose';
import { Dropdown } from "semantic-ui-react";
import { WithDataProps } from "react-orbitjs";
import { withTranslations, i18nProps } from "@lib/i18n";

import { attributesFor } from "@data/helpers";
import { UserAttributes } from "@data/models/user";
import { ResourceObject } from "jsonapi-typescript";
import { USERS_TYPE, update } from "@data";
import { withCurrentUserContext } from "@data/containers/with-current-user";

export interface IOwnProps {
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  onChange: (locale: string) => void;
  className?: string;
}

export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps;

const translationMap = { 'en-US': 'en','es-419': 'es', 'fr-FR': 'fr' };

class LocaleSelect extends React.Component<IProps> {

  onSelect = async (e, {value}) => {
    e.preventDefault();

    const { i18n } = this.props;
    const { currentUser, dataStore } = this.props;

    i18n.changeLanguage(value);

    await update(dataStore, currentUser, {
      attributes: { locale: value }
    });
  }

  render() {
    const { currentUser, i18n } = this.props;
    const attributes = attributesFor(currentUser) as UserAttributes;
    const userLocale = attributes.locale;
    const { options, language } = i18n;
    const languages = Object.keys(options.resources);

    const selected = userLocale || language;

    const languageOptions = languages.map(locale => ({ text: translationMap[locale], value: locale }));

    return (
      <Dropdown
        data-test-locale-switcher
        inline
        options={languageOptions}
        defaultValue={selected}
        onChange={this.onSelect}
      />
    );
  }
}

export default compose(
  withTranslations,
  withCurrentUserContext,
)(LocaleSelect);
