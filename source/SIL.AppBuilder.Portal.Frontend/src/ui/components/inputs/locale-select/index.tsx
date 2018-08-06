import * as React from "react";
import { compose } from 'recompose';
import { withCurrentUser } from "@data/with-current-user";
import { UserAttributes } from "@data/models/user";
import { TYPE_NAME as USER } from "@data/models/user";
import { attributesFor } from "@data/helpers";
import { WithDataProps } from "react-orbitjs";
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Dropdown } from "semantic-ui-react";

export interface IOwnProps {
  currentUser: JSONAPI<UserAttributes>;
  onChange: (string) => void;
  className?: string;
}

export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps

const translationMap = {'en-US': 'en','es-PE': 'es'};

class LocaleSelect extends React.Component<IProps> {

  onSelect = async (e, {value}) => {

    const { i18n } = this.props;
    //const { currentUser } = this.props;

    i18n.changeLanguage(value);

    //TODO: ENDPOINT NOT WORKING

    // await this.props.updateStore(t => t.replaceAttribute(
    //   { type: USER, id: currentUser.id }, 'locale', selection
    // ))
  }

  render() {
    const { currentUser, i18n } = this.props;
    const userLocale = attributesFor(currentUser).locale;
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
  withCurrentUser(),
  translate('translations')
)(LocaleSelect);