import { useState } from 'react';

export function useToggle(defaultValue: boolean = false) {
  const [value, setValue] = useState(defaultValue);

  return [value, () => setValue(!value)];
}
