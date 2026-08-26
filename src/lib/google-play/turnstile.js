// Codes where the Google Play locale's base language tag doesn't match Turnstile's.
// https://developers.cloudflare.com/turnstile/reference/supported-languages/
const LANGUAGE_OVERRIDES = /** @type {Record<string, string>} */ ({
  'iw-IL': 'he', // Hebrew: Google Play uses the legacy ISO 639-1 code
  'no-NO': 'nb', // Norwegian: Turnstile only supports Bokmål
  'fil': 'tl-ph', // Filipino: Ternstile only supports Tagalog (better than defaulting to English)
  'zh-TW': 'zh-tw', // Chinese (Traditional, Taiwan): base 'zh' would default to Simplified
  'zh-HK': 'zh-tw' // Chinese (Traditional, Hong Kong): Turnstile has no zh-hk, zh-tw is closer than Simplified
});

const TURNSTILE_BASE_LANGUAGES = new Set([
  'ar',
  'bg',
  'zh',
  'hr',
  'cs',
  'da',
  'nl',
  'en',
  'fa',
  'fi',
  'fr',
  'de',
  'el',
  'he',
  'hi',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'lt',
  'ms',
  'nb',
  'pl',
  'pt',
  'ro',
  'ru',
  'sr',
  'sk',
  'sl',
  'es',
  'sv',
  'tl',
  'th',
  'tr',
  'uk',
  'vi'
]);

/**
 * Maps a Google Play locale code to a Turnstile-supported language code,
 * falling back to 'auto' (browser detection) when Turnstile has no match.
 * @param {string} locale
 * @returns {string}
 */
export function toTurnstileLanguage(locale) {
  if (LANGUAGE_OVERRIDES[locale]) {
    return LANGUAGE_OVERRIDES[locale];
  }

  const base = locale.split('-')[0];
  return TURNSTILE_BASE_LANGUAGES.has(base) ? base : 'auto';
}

/**
 * @param {string} containerId
 * @param {string | undefined} sitekey
 * @param {(token: string) => void} callback
 * @param {string} [language]
 */
export function initTurnstile(containerId, sitekey, callback, language = 'auto') {
  if (sitekey) {
    // @ts-ignore
    const widgetId = turnstile.render(containerId, {
      sitekey,
      callback,
      language
    });

    return () => {
      // @ts-ignore
      turnstile.remove(widgetId);
    };
  } else {
    console.error('Turnstile SiteKey not set!');
  }
}