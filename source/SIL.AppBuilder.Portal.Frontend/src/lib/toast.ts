import { notify } from 'react-notify-toast';

// TODO: do we want queued notifications
// for displaying multiple?
// not sure if at same time
// https://www.npmjs.com/package/react-notify-toast#queued-notifications
export interface NotifyOptions {
  type?: string;
  timeout?: number; // ms, default 5000ms
  color?: {
    background: string;
    text: string;
  };
}
export function show(msg: string, options: NotifyOptions) {
  // notify.show(msg, options.type, options.timeout);
}

export function custom(msg: string, options: NotifyOptions) {
  // notify.show(msg, 'custom', options.timeout, options.color);
}

export function success(msg: string, options: NotifyOptions = {}) {
  show(msg, { type: 'success', ...options });
}

export function warning(msg: string, options: NotifyOptions = {}) {
  show(msg, { type: 'warning', ...options });
}

export function error(msg: string, options: NotifyOptions = {}) {
  show(msg, { type: 'error', ...options });
}

export function neutral(msg: string, options: NotifyOptions = {}) {
  show(msg, { ...options });
}
