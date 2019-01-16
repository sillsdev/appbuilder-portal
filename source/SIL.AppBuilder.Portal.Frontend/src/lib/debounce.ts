// http://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate?) {
  return function() {
    const context = this;
    const args = arguments;

    // clear the previous
    if (context.timeout) {
      clearTimeout(context.timeout);
    }

    const later = function() {
      context.timeout = null;

      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !context.timeout;

    clearTimeout(context.timeout);
    context.timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}
