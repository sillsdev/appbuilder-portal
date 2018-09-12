declare module "@pollyjs/adapter-fetch";
declare module "@pollyjs/adapter-xhr";
declare module "@pollyjs/core";

type Troolean =
| boolean
| undefined;

type Id =
| string
| number;

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