import { translate } from 'react-i18next';
import { compose, mapProps, withProps } from 'recompose';

export { InjectedTranslateProps as i18nProps } from 'react-i18next';

const defaultNamespace = 'translations';
export const withTranslations = translate(defaultNamespace);
