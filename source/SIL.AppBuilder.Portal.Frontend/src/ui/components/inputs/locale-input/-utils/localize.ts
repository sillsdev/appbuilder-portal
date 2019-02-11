// The tag data needs to be localized before searching, so that someone searching
// in their UI language can have better results
//
// TODO: apply the language delimeter
export function localizeTagData(data: ILanguageInfo[], t): ILanguageInfo[] {
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

      // These are the only fields that need localization
      region: info.region && t(`ldml.localeDisplayNames.territories.${info.region}`),
      regions:
        info.regions &&
        info.regions
          .split(' ')
          .map((region) => t(`ldml.localeDisplayNames.territories.${region}`))
          .join(', '),
    };
  });
}
