import * as React from 'react';

export const resetTimeout = (id, newID) => {
  clearTimeout(id);

  return newID;
};

export interface IDebounceInputConfig {
  delayMs;
  onTrigger: () => void;
}

// Inspired by:
// https://codepen.io/Lance-Jernigan/pen/qrxmpp?editors=0010
export const debounceInput = (context: any, config: IDebounceInputConfig) => {
  const { delayMs, onTrigger } = config;

  const handleInput = (e: React.FormEvent<any>) => {
    e.preventDefault();
    const value = e.currentTarget.value;

    context.setState({
      timeout: resetTimeout(context.state.timeout, setTimeout(onTrigger.bind(context), delayMs)),
      value,
    });
  };

  return handleInput;
};

// http://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate?) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;

    const later = function() {
      timeout = null;

      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}
