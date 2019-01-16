import { toast as notify, ToastOptions } from 'react-toastify';
import { parseError } from '@ui/components/errors/parse-error';

export function show(msg: string, options: ToastOptions) {
  try {
    notify(msg, options);
  } catch (e) {
    console.error('Something horrible happened', e);
  }
}

export function custom(msg: string, options: ToastOptions) {
  notify(msg, { ...options, className: 'custom' });
}

export function success(msg: string, options: ToastOptions = {}) {
  notify.success(msg, options);
}

export function warning(msg: string, options: ToastOptions = {}) {
  notify.warn(msg, options);
}

export function error(err: string, options: ToastOptions = {}) {
  const parsed = parseError(err);
  const msg = `${parsed.title} ${parsed.body || ''}`;

  notify.error(msg, options);
}

export function neutral(msg: string, options: ToastOptions = {}) {
  notify.info(msg, options);
}

// Debugging Tests:
// warning('hello there');
// success('hello there');
// error('hello there');
// neutral('hello there');
