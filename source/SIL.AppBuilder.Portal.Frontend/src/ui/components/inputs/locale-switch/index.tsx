import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { UserAttributes } from '@data/models/user';
import { ResourceObject } from 'jsonapi-typescript';

import { USERS_TYPE, update } from '@data';

import { useCurrentUser } from '~/data/containers/with-current-user';

import { useTranslations } from '~/lib/i18n';

import { useOrbit, attributesFor } from 'react-orbitjs';

export interface IOwnProps {
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  onChange: (locale: string) => void;
  className?: string;
}

export type IProps = IOwnProps;

const translationMap = { 'en-US': 'en', 'es-419': 'es', 'fr-FR': 'fr' };

export default function LocaleSwitch({ onChange, className }: IProps) {
  const { i18n } = useTranslations();
  const { currentUser } = useCurrentUser();
  const { dataStore } = useOrbit();

  const onSelect = async (e, { value }) => {
    e.preventDefault();

    i18n.changeLanguage(value);

    await update(dataStore, currentUser, {
      attributes: { locale: value },
    });
  };

  const attributes = attributesFor(currentUser) as UserAttributes;
  const userLocale = attributes.locale;
  const { options, language } = i18n;
  const languages = Object.keys(options.resources);

  const selected = userLocale || language;

  const languageOptions = languages.map((locale) => ({
    text: translationMap[locale],
    value: locale,
  }));

  return (
    <Dropdown
      data-test-locale-switcher
      inline
      options={languageOptions}
      defaultValue={selected}
      onChange={onSelect}
    />
  );
}
