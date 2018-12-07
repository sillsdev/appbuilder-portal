declare module "@pollyjs/adapter-fetch";
declare module "@pollyjs/adapter-xhr";
declare module "@pollyjs/core";

type Troolean =
| boolean
| undefined;

type Id =
| string
| number;

type MaybeFunction<T, TProps> = T | ((props: TProps) => T);

declare module "public/images/*";

interface Auth0JWT {
  alg: string;
  typ: string;

  sub: string;
  exp: number;

  picture: string;
  locale: string;
  nickname: string;
  given_name: string;
  family_name: string;
  name: string;
  gender: string;
  email: string;
}

type FnParams<TParams, TResult> = (passedProps: TParams) => TResult;

type FnOrObject<TParams, TResult> =
  | TResult
  | FnParams<TParams, TResult>;
