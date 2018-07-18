type Troolean =
  | boolean
  | undefined

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

declare type JSONAPI<Attributes, Relationships = {}> = {
  id: string;
  type: string;
  attributes: Attributes;
  relationships: Relationships
}
