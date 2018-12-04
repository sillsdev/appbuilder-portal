import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';

export const pathName = '/not-found';

class NotFoundRoute extends React.Component<i18nProps> {
  render() {
    const { t } = this.props;

    return (
      <div className='ui text container'>
        <h1 className='ui header p-t-lg'>{t('errors.notFoundTitle')}</h1>
        <div className='content'>{t('errors.notFoundDescription')}</div>
      </div>
    );
  }
}

export default compose(
  withTranslations
)(NotFoundRoute);

