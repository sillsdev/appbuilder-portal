// Codes where the Google Play locale's base language tag doesn't match Turnstile's.
// https://developers.cloudflare.com/turnstile/reference/supported-languages/
const LANGUAGE_OVERRIDES: Record<string, string> = {
  'iw-IL': 'he', // Hebrew: Google Play uses the legacy ISO 639-1 code
  'no-NO': 'nb', // Norwegian: Turnstile only supports Bokmål
  fil: 'tl-ph', // Filipino: Ternstile only supports Tagalog (better than defaulting to English)
  'zh-TW': 'zh-tw', // Chinese (Traditional, Taiwan): base 'zh' would default to Simplified
  'zh-HK': 'zh-tw' // Chinese (Traditional, Hong Kong): Turnstile has no zh-hk, zh-tw is closer than Simplified
};

const TURNSTILE_BASE_LANGUAGES = new Set([
  'ar',
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fa',
  'fi',
  'fr',
  'he',
  'hi',
  'hr',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'lt',
  'ms',
  'nb',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sr',
  'sv',
  'th',
  'tl',
  'tr',
  'uk',
  'vi',
  'zh'
]);

/**
 * Maps a Google Play locale code to a Turnstile-supported language code,
 * falling back to 'auto' (browser detection) when Turnstile has no match.
 * There are currently 34 languages that don't have a match in Turnstile.
 */
export function toTurnstileLanguage(locale: string) {
  if (LANGUAGE_OVERRIDES[locale]) {
    return LANGUAGE_OVERRIDES[locale];
  }

  const base = locale.split('-')[0];
  return TURNSTILE_BASE_LANGUAGES.has(base) ? base : 'auto';
}

export function initTurnstile(
  containerId: string,
  sitekey: string | undefined,
  callback: (token: string) => void,
  language = 'auto'
) {
  if (sitekey) {
    // @ts-expect-error turnstile is a global variable set by imported cloudflare library
    const widgetId = turnstile?.render(containerId, {
      sitekey,
      callback,
      language
    });

    return () => {
      // @ts-expect-error turnstile is a global variable set by imported cloudflare library
      turnstile?.remove(widgetId);
    };
  } else {
    console.error('Turnstile SiteKey not set!');
  }
}

export function resolveToken(formData: FormData) {
  const tokenFromForm = formData.get('cf-turnstile-response');
  const tokenFromWidget = window.turnstile?.getResponse?.();
  const token =
    typeof tokenFromForm === 'string' && tokenFromForm.length > 0 ? tokenFromForm : tokenFromWidget;
  if (typeof token === 'string' && token.length > 0) {
    return token;
  } else {
    return null;
  }
}
