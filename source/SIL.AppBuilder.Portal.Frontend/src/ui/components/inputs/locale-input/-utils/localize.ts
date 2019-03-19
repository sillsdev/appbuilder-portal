// The tag data needs to be localized before searching, so that someone searching
// in their UI language can have better results
//
// TODO: apply the language delimeter
export function localizeTagData(data: ILanguageInfo[], t): ILanguageInfo[] {
  const tryLocalize = (namespace: string, str: string, name: string) => {
    let result = t(`localeDisplayNames.${namespace}.${str}`);

    if (result.includes('localeDisplayNames.')) {
      return name; // localization was not found
    }

    return result;
  };

  return data.map((info) => {
    return {
      ...info,
      // These do not need translation:
      //  - full: string;
      //  - iana: string;
      //  - iso639_3: string;
      //  - localname?: string;
      //  - name: string;
      //  - names?: string[];
      //  - regionname: string;
      //  - sldr: boolean;
      //  - tag: string;
      //  - tags?: string[];
      //  - variants?: string[];
      nameInLocale: tryLocalize('languages', info.tag, info.name),

      // These are the only fields that need localization
      region: info.region && tryLocalize('territories', info.region, info.region),
      regions:
        info.regions && info.regions.map((region) => tryLocalize('territories', region, region)),
    };
  });
}
