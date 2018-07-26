import * as React from 'react';
import * as i18n from 'i18next';
import * as Backend from 'i18next-xhr-backend';
import * as LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

import enUs from './locales/en-us';

const localTranslations = {
  en: { translations: enUs },
  'en-US': { translations: enUs }
};

i18n
  // https://github.com/i18next/i18next-xhr-backend
  // .use(Backend)
  // https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  .init({
    resources: localTranslations,
    fallbackLng: 'en',

    // common namespace for the app
    ns: ['translations'],
    defaultNS: 'translations',

    /* debug: true, */

    interpolation: {
      // react already does escaping
      escapeValue: false,
    },

    react: {
      wait: true,
      // bindI18n: 'languageChanged loaded',
      // bindStore: 'added removed'
    }
  });

export default i18n;
