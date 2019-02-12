import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useFetch } from 'react-hooks-fetch';

import { PageLoader } from '~/ui/components/loaders';

const namespace = 'ldml';

function LocaleLoader() {
  const { t, i18n } = useTranslation();
  const { language } = i18n;
  const { error, data } = useFetch(`/assets/language/${language}/${namespace}.json`);

  if (!data) {
    return null;
  }

  i18n.addResourceBundle(language, namespace, data, true, true);
  i18n.reloadResources();

  return null;
}

export function L10nLoader({ children }) {
  const { i18n } = useTranslation();
  const { language } = i18n;

  if (i18n.hasResourceBundle(language, namespace)) {
    return children;
  }

  return (
    <React.Suspense fallback={<PageLoader />}>
      <LocaleLoader />
      {children}
    </React.Suspense>
  );
}
