import * as React from "react";
import { compose } from 'recompose';
import { withCurrentUser } from "@data/containers/with-current-user";
import { UserAttributes } from "@data/models/user";
import { TYPE_NAME as USER } from "@data/models/user";
import { attributesFor } from "@data/helpers";
import { WithDataProps } from "react-orbitjs";
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Dropdown } from "semantic-ui-react";

export interface IOwnProps {
  currentUser: JSONAPI<UserAttributes>;
  onChange: (locale: string) => void;
  className?: string;
}

export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps;

const translationMap = {'en-US': 'en','es-PE': 'es'};

class LocaleSelect extends React.Component<IProps> {

  onSelect = async (e, {value}) => {
    e.preventDefault();

    const { i18n } = this.props;
    const { currentUser } = this.props;
    const { id } = currentUser.data;

    i18n.changeLanguage(value);

    await this.props.updateStore(t => t.replaceAttribute(
      { type: USER, id }, 'locale', value
    ));
  }

  render() {
    const { currentUser, i18n } = this.props;
    const attributes = attributesFor(currentUser) as UserAttributes;
    const userLocale = attributes.locale;
    const { default: { options, language } } = i18n;
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
  translate('translations'),
  withCurrentUser(),
)(LocaleSelect);
