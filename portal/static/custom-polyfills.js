if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function (
    /** @type {((a: any, b: any) => number) | undefined} */ compareFn
  ) {
    if (typeof compareFn !== 'function') {
      throw new Error(`Array.prototype.toSorted: ${compareFn} is not a function!`);
    }
    return this.slice(0).sort(compareFn);
  };
}
