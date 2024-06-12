import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

let fallback = 'en';

register('en', () => import('./locales/en-us.json'));
register('es', () => import('./locales/es-419.json'));
register('fr', () => import('./locales/fr-FR.json'));
init({
  initialLocale: getLocaleFromNavigator(),
  fallbackLocale: fallback
});
