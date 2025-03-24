import * as m from './paraglide/messages';

type ValidKey<T extends object> = {
  [K in keyof T]: T[K] extends () => void ? K : never;
}[keyof T];
export type ValidI13nKey = ValidKey<typeof m>;
