import React from 'react';
import { Popup } from 'semantic-ui-react';
import { useTranslations } from '~/lib/i18n';
import DebouncedSearch from '~/ui/components/inputs/debounced-search-field';


export function HeaderSearch({ onSearch }) {
  const { t } = useTranslations();

  return (
    <Popup
      basic
      hoverable
      trigger={
        <div>
          <DebouncedSearch
            className='search-component'
            placeholder={t('common.search')}
            onSubmit={onSearch}
          />
        </div>
      }
      position='bottom center'
    >
      <div dangerouslySetInnerHTML={{ __html: t('directory.search-help') }} />
    </Popup>
  );
}
