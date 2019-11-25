import * as React from 'react';
import { Suspense } from 'react';
import { RectLoader } from '@ui/components/loaders';
import { useFetch } from 'react-hooks-fetch';
import { ErrorMessage, ErrorBoundary } from '@ui/components/errors';

import LocaleInputField from './field';

export interface IProps {
  value: string;
  onChange: (localeCode: string) => void;
  style?: string;
}

function LocaleInput(props: IProps) {
  const { error, data } = useFetch('/assets/language/langtags.json');

  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return <LocaleInputField {...{ ...props, data }} />;
}

const loader = (
  <div className='flex justify-content-center w-100'>
    <RectLoader />
  </div>
);

export default function LocaleInputLoader(props: IProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={loader}>
        <LocaleInput {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
