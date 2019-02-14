declare module '@pollyjs/adapter-fetch';
declare module '@pollyjs/adapter-xhr';
declare module '@pollyjs/core';

type Troolean = boolean | undefined;

type Id = string | number;

type MaybeFunction<T, TProps> = T | ((props: TProps) => T);

declare module 'public/images/*';

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

type FnOrObject<TParams, TResult> = TResult | FnParams<TParams, TResult>;

interface IMap<TVal> {
  [key: string]: TVal;
}

interface Dict<TKey, TVal> {
  key: TKey;
  value: TVal;
}

// tag: canonical language tag
// full: fully qualified language tag
// localname: name of language in the language and script
// name: name of the language in English
// names: alternate name of the language in English
// region: primary geographic region
// regions: alternate regions
interface ILanguageInfo {
  full: string;
  iana: string;
  iso639_3: string;
  localname?: string;
  name: string;
  names?: string[];
  region: string;
  regionname: string;
  regions?: string;
  sldr: boolean;
  tag: string;
  tags?: string[];

  // app-managed
  nameInLocale: string;
}

interface ILDMLData {
  identity: {};
  localeDisplayNames: {
    // language: "Language: {0}"
    // script: "Script: {0}"
    // territory: "Region: {0}"
    codePatterns: {};

    // colNumeric: "Numeric Sorting"
    // colReorder: "Script/Block Reordering"
    // colStrength: "Sorting Strength"
    // collation: "Sort Order"
    // currency: "Currency"
    // fw: "First day of week"
    // hc: "Hour Cycle (12 vs 24)"
    // kv: "Highest Ignored"
    keys: {};

    // tag => localized name
    languages: {};

    // localeKeyTypePattern: "{0}: {1}"
    // localePattern: "{0} ({1})"
    // localeSeparator: "{0}, {1}"
    localeDisplayPattern: {};

    // UK: "UK"
    // US: "US"
    // metric: "Metric"
    measurementSystemNames: {};

    // abbr -> name
    scripts: {};

    // 1
    // 2
    // 3
    // => Territory
    territories: {};

    // BGN
    // Numeric
    // Tone
    // UNGEGN
    transformNames: {};

    // account
    // ahom
    // arab
    // arabext
    // armn
    // bali
    // big5han
    // breakall
    types: { [typeName: string]: string };

    // 1606NICT
    // 1994
    // NJIVA
    // OSOJS
    // OXENDICT
    variants: { [isoName: string]: string };
  };
}
