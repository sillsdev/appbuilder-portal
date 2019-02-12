import * as React from 'react';
import { withTranslations, i18nProps } from '@lib/i18n';

import { MIT } from './licenses/links';

@withTranslations
export default class OpenSourceRoute extends React.Component<i18nProps> {
  render() {
    const { t } = this.props;

    return (
      <div className='flex-column align-items-center w-100'>
        <h1 className='m-t-lg'>{t('attributions.title')}</h1>
        <hr className='w-100' />

        <div className='m-t-md'>
          <h2>{t('attributions.subtitle')}</h2>

          <h3>
            <MIT />
          </h3>
          <a href='https://reactjs.org/' target='_blank' rel='noopener noreferrer'>
            React
          </a>
        </div>
      </div>
    );
  }
}
