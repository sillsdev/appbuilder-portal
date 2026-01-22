export type RequirePrimitive<T> = {
  [K in keyof T]: Extract<T[K], string | number | boolean | Date | null | undefined>;
};
