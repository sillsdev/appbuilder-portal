type Primitive = string | number | boolean | Date;
export type RequirePrimitive<T> = {
  [K in keyof T]: Extract<T[K], Primitive | null | undefined | Primitive[]>;
};
