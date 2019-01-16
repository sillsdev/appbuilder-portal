export function timeoutablePromise(timeoutMs, promise) {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`Timed out after ${timeoutMs} ms.`);
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]);
}
