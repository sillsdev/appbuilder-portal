import SparkPost from 'sparkpost';

if (!process.env.VITE_SPARKPOST_API_KEY) {
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore This is necessary for sveltekit, where import.meta.env will in fact exist
  process.env.VITE_SPARKPOST_API_KEY = import.meta.env.VITE_SPARKPOST_API_KEY;
  // @ts-ignore This is necessary for sveltekit, where import.meta.env will in fact exist
  process.env.VITE_SPARKPOST_EMAIL = import.meta.env.VITE_SPARKPOST_EMAIL;
  /* eslint-enable @typescript-eslint/ban-ts-comment */
}

const sp = new SparkPost(process.env.VITE_SPARKPOST_API_KEY);
export function sendEmail(to: { email: string; name: string }[], subject: string, body: string) {
  sp.transmissions.send({
    options: {
      transactional: true,
      click_tracking: false,
      open_tracking: false
    },
    content: {
      from: {
        email: process.env.VITE_SPARKPOST_EMAIL,
        name: 'Scriptoria' + (process.env.NODE_ENV === 'development' ? ' (dev)' : '')
      },
      subject,
      html: body
    },
    recipients: to.map((email) => ({ address: email }))
  });
}
