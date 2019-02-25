import * as React from 'react';
import { useFetch } from 'react-hooks-fetch';

import { PageLoader } from '~/ui/components/loaders';
import { ErrorBoundary, PageError } from '~/ui/components/errors';
import { useTranslations } from '~/lib/i18n';

const namespace = 'ldml';

function LocaleLoader() {
  const { t, i18n } = useTranslations();
  const { language } = i18n;
  const { error, data } = useFetch(`/assets/language/${language}/${namespace}.json`);

  if (error) {
    return <PageError error={error} />;
  }

  if (!data) {
    return null;
  }

  i18n.addResourceBundle(language, namespace, data, true, true);
  i18n.reloadResources();

  return null;
}

export function L10nLoader({ children }) {
  const { i18n } = useTranslations();
  const { language } = i18n;

  if (i18n.hasResourceBundle(language, namespace)) {
    return children;
  }

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<PageLoader />}>
        <LocaleLoader />
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}
