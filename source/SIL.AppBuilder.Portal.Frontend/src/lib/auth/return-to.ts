const RETURN_TO_PATH_KEY = 'return-to-path';

export function storePath(path) {
  localStorage.setItem(RETURN_TO_PATH_KEY, path);
}

export function retrievePath(clear = false) {
  const value = localStorage.getItem(RETURN_TO_PATH_KEY);

  if(clear) {
    localStorage.removeItem(RETURN_TO_PATH_KEY);
  }

  return value;
}
