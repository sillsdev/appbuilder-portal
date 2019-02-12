import { withTranslation, useTranslation } from 'react-i18next';

export { TransProps as i18nProps } from 'react-i18next';

const defaultNamespace = 'translations';
const ldml = 'ldml';

export const withTranslations = withTranslation(defaultNamespace);
export const withLdml = withTranslation(ldml);

export function useLdml() {
  return useTranslation(ldml);
}

export function useTranslations() {
  return useTranslation(defaultNamespace);
}
