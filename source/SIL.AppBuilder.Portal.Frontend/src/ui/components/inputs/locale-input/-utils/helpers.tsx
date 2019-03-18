import * as React from 'react';

export const hasSearchTerm = (searchTerm?: string) => {
  let lowerSearch = (searchTerm || '').trim().toLocaleLowerCase();

  return (property: string) => {
    try {
      return (property || '').toLocaleLowerCase().includes(lowerSearch);
    } catch (e) {
      console.error(`searched for ${searchTerm} against value: ${property}`, e);
    }
  };
};

export const getSuggestions = (data: ILanguageInfo[]) => (value) => {
  const has = hasSearchTerm(value);

  return data.filter(
    ({ name, nameInLocale, region, tag, localname, regions, names, variants }) =>
      has(nameInLocale) ||
      has((names || []).join()) ||
      has(localname || name) ||
      has((regions || []).join()) ||
      has(region) ||
      has((variants || []).join()) ||
      has(tag)
   );
};

export const getSuggestionValue = (suggestion: ILanguageInfo) => suggestion.tag;

export function findLanguageCode(data: ILanguageInfo[]) {
  return (value: string) => {
    const info = data.find((lang) => lang.tag === value);

    return (info && info.tag) || '';
  };
}

export function findLanguageInfo(data: ILanguageInfo[]) {
  return (value: string) => {
    const info = data.find((lang) => lang.tag === value);

    return info;
  };
}

export function highlightIfPresent(term: string, highlight: string) {
  term = term || '';

  let termLower = term.toLowerCase();
  let highLower = highlight.toLowerCase();

  if (!termLower.includes(highLower)) {
    return term;
  }

  const beginIdx = termLower.indexOf(highLower);
  const endIdx = beginIdx + highlight.length - 1;
  const beginning = term.substring(0, beginIdx);
  const ending = term.substring(endIdx + 1);
  const termHighlight = term.slice(beginIdx, endIdx + 1);

  return (
    <span className='phrase-with-highlight'>
      {beginning}
      <span className='highlight'>{termHighlight}</span>
      {ending}
    </span>
  );
}

// return values:
// -1 a is less than b
// 1 a is more than b
// 0 a and b are the same
//
// logic from:
// https://github.com/sillsdev/libpalaso/blob/master/SIL.WritingSystems/LanguageLookup.cs#L290
//
// this is a straight port of the C# code
//
/// Sorting the languages for display is tricky: we want the most relevant languages at the
/// top of the list, so we can't simply sort alphabetically by language name or by language tag,
/// but need to take both items into account together with the current search string.  Ordering
/// by relevance is clearly impossible since we'd have to read the user's mind and apply that
/// knowledge to the data.  But the heuristics we use here may be better than nothing...
export function sortComparer(searchTerm?: string) {
  const lowerSearch = (searchTerm || '').toLocaleLowerCase();

  return (x: ILanguageInfo, y: ILanguageInfo) => {
    if (x.tag === y.tag) {
      return 0;
    }

    // Favor ones where some language name matches the search string to solve BL-1141
    // We restrict this to the top 2 names of each language, and to cases where the
    // corresponding names of the two languages are different.  (If both language names
    // match the search string, there's no good reason to favor one over the other!)
    if (x.names && y.names) {
      let [xFirst, xSecond] = x.names.map((n) => n.toLocaleLowerCase());
      let [yFirst, ySecond] = y.names.map((n) => n.toLocaleLowerCase());

      if (xFirst !== yFirst) {
        if (xFirst === lowerSearch) {
          return -1;
        }
        if (yFirst === lowerSearch) {
          return 1;
        }
      } else if (xSecond !== ySecond) {
        // If we get here, x.Names[0] == y.Names[0].  If both equal the search string, then neither x.Names[1]
        // nor y.Names[1] should equal the search string since the code adding to Names checks for redundancy.
        // Also it's possible that neither x.Names[1] nor y.Names[1] exists at this point in the code, or that
        // only one of them exists, or that both of them exist (in which case they are not equal).
        if (xSecond === lowerSearch) {
          return -1;
        }
        if (ySecond === lowerSearch) {
          return 1;
        }
      }
    }

    // Favor a language whose tag matches the search string exactly.  (equal tags are handled above)
    if (x.tag.toLocaleLowerCase() === lowerSearch) {
      return -1;
    }
    if (y.tag.toLocaleLowerCase() === lowerSearch) {
      return 1;
    }

    // NOTE: there is no script or variant, so it was not ported from the C#
    let { tag: xTag, name: xName, region: xRegion } = x;
    let { tag: yTag, name: yName, region: yRegion } = y;
    let bothTagLanguagesMatchSearch = xName === yName && xName.toLocaleLowerCase() === lowerSearch;

    if (!bothTagLanguagesMatchSearch) {
      // One of the tag language pieces may match the search string even though not both match.  In that case,
      // sort the matching language earlier in the list.
      if (xName.toLocaleLowerCase() === lowerSearch) {
        return -1;
      }
      if (yName.toLocaleLowerCase() === lowerSearch) {
        return 1;
      }
    }

    if (xTag.length < yTag.length) {
      return -1;
    }
    if (yTag.length < xTag.length) {
      return 1;
    }

    // if (!bothTagLanguagesMatchSearch) {
    // TODO: do we want a fuzzy match on the tag names?
    // }

    return x.tag.localeCompare(y.tag);
  };
}
