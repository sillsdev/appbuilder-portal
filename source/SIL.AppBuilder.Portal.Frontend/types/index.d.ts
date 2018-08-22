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


// Resource
declare interface JSONAPI<Attributes, Relationships = {}> {
  id: string;
  type: string;
  attributes: Attributes;
  relationships?: Relationships;
};

// Document
declare interface JSONAPIDocument<Attributes, Relationships = {}> {
  data: JSONAPI<Attributes, Relationships>;
  included?: Array<JSONAPI<any, any>>;
};
