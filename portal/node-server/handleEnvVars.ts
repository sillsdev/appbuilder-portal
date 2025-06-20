// TODO: I don't actually think this is necessary anymore
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck This is necessary for sveltekit, where import.meta.env will in fact exist
/* eslint-enable @typescript-eslint/ban-ts-comment */
if (!process.env.VITE_MAIL_SENDER && import.meta.env.VITE_MAIL_SENDER) {
  console.log('Setting environment variables from import.meta.env');
  process.env.VITE_MAIL_SENDER = import.meta.env.VITE_MAIL_SENDER;
  process.env.VITE_SPARKPOST_API_KEY = import.meta.env.VITE_SPARKPOST_API_KEY;
  process.env.VITE_SPARKPOST_EMAIL = import.meta.env.VITE_SPARKPOST_EMAIL;
}
