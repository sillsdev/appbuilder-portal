/**
 * @param {string} containerId
 * @param {string} sitekey
 * @param {(token: string) => void} callback
 */
export function initTurnstile(containerId, sitekey, callback) {
    // @ts-ignore
    const widgetId = turnstile.render(containerId, {
      sitekey,
      callback
    });

    return () => {
      // @ts-ignore
      turnstile.remove(widgetId);
    };
}