import * as React from 'react';
import i18next from 'i18next';

import { highlightIfPresent } from './-utils/helpers';
import { findAdditionalMatches } from './-utils/find-additional-matches';

interface IProps {
  suggestion: ILanguageInfo;
  searchedValue: string;
  t: i18next.TFunction;
}

export function Suggestion({ suggestion, searchedValue, t }: IProps) {
  const { localname, name, tag } = suggestion;
  const additionalMatch = findAdditionalMatches(suggestion, searchedValue);

  return (
    <div className='flex-col'>
      <div className='flex-row justify-content-space-between'>
        <div className='flex-col m-r-md'>
          <div className='black-text'>{highlightIfPresent(localname || name, searchedValue)}</div>
          <div className='fs-11 gray-text m-r-sm'>{tag}</div>
        </div>
        <div className='flex-col text-align-right'>
          <div data-test-tag className='black-text'>
            {highlightIfPresent(tag, searchedValue)}
          </div>
          <div className='fs-11 gray-text'>{t('locale-picker.code')}</div>
        </div>
      </div>

      {additionalMatch && additionalMatch.match && (
        <div className='flex-row justify-content-space-between m-t-md'>
          <div className='flex-col'>
            <div className='fs-11 gray-text uppercase'>
              {t(`locale-picker.${additionalMatch.match.key}`, { num: additionalMatch.match.num })}
            </div>
            <div className='black-text single-line-clamp' style={{ maxWidth: '370px' }}>
              {highlightIfPresent(additionalMatch.match.value, searchedValue)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
