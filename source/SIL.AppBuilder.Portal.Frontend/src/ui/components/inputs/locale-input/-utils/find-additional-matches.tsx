import { hasSearchTerm } from './helpers';

type MatchResult = Dict<string, string> & { num: number };

interface IAdditionalSearchResult {
  match?: MatchResult;
  additionalMatches: MatchResult[];
}

const translationMap = {
  full: 'tag',
  iana: 'tag',
  ['iso639_3']: 'tag',
  name: 'name',
  names: 'name',
  region: 'region',
  regions: 'region',
  regionname: 'regionName',
  tag: 'tag',
  tags: 'tag',
};

export function findAdditionalMatches(
  suggestion: ILanguageInfo,
  searchTerm: string
): IAdditionalSearchResult {
  // NOTE: things shown in the UI:
  //  - localname || name
  //  - name in UI language
  //  - tag
  //
  // Non-searchable:
  //  - sldr
  const unsearchable = ['sldr'];
  const defaultDisplayedKeys = ['localname', 'name', 'tag'];
  const keysToSkip = [...defaultDisplayedKeys, ...unsearchable];
  const has = hasSearchTerm(searchTerm);
  const result: IAdditionalSearchResult = { additionalMatches: [] };

  const updateResult = (entry: MatchResult) => {
    result.match ? result.additionalMatches.push(entry) : (result.match = entry);
  };

  let hasDefault = defaultDisplayedKeys.find((key) => has(suggestion[key]));

  if (hasDefault) {
    return result;
  }

  if (has('localname') || has('name') || has('tag')) {
    return result;
  }

  Object.keys(suggestion).forEach((key) => {
    if (keysToSkip.includes(key)) {
      return;
    }
    let rawValue = suggestion[key];
    // TODO: localize separator, and values
    const value = Array.isArray(rawValue) ? rawValue.join(', ') : rawValue;
    const num = Array.isArray(rawValue) ? rawValue.length : 1;

    if (has(value)) {
      updateResult({ key: translationMap[key], value, num });
    }
  });

  return result;
}
