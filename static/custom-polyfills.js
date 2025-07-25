if (typeof Array.prototype.toSorted !== 'function') {
  Object.defineProperty(Array.prototype, 'toSorted', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function (/** @type {((a: any, b: any) => number) | undefined} */ compareFn) {
      if (compareFn && typeof compareFn !== 'function') {
        throw new TypeError(`Array.prototype.toSorted: ${compareFn} is not a function!`);
      }
      return this.slice(0).sort(compareFn);
    }
  });
}
