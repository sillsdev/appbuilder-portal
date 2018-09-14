import * as i18n from 'i18next';
import * as ICU from 'i18next-icu';
// import * as Backend from 'i18next-xhr-backend';
import * as LanguageDetector from 'i18next-browser-languagedetector';
// import { reactI18nextModule } from 'react-i18next';

import * as enUs from './locales/en-us.json';
import * as esLa from './locales/es-419.json';

const localTranslations = {
  'en-US': { translations: enUs },
};

i18n
  // https://github.com/i18next/i18next-icu
  .use(ICU)
  // https://github.com/i18next/i18next-xhr-backend
  // .use(Backend)
  // https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  .init({
    resources: {},
    fallbackLng: 'en-US',

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

i18n.default.addResourceBundle('es-419', 'translations', esLa);
i18n.default.addResourceBundle('en-US', 'translations', enUs);

export default i18n;

