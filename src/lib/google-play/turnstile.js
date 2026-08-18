/**
 * @param {string} containerId
 * @param {string | undefined} sitekey
 * @param {(token: string) => void} callback
 */
export function initTurnstile(containerId, sitekey, callback) {
  if (sitekey) {
    // @ts-ignore
    const widgetId = turnstile.render(containerId, {
      sitekey,
      callback
    });

    return () => {
      // @ts-ignore
      turnstile.remove(widgetId);
    };
  } else {
    console.error('Turnstile SiteKey not set!');
  }
}