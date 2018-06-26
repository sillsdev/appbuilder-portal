type Troolean =
  | boolean
  | undefined

declare module "public/images/*";

interface Auth0JWT {
  alg: string;
  typ: string;

  sub: string;
  exp: number;
}