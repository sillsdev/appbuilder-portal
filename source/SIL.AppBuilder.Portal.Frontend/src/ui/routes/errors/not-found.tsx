import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

export const pathName = '/not-found';

class NotFoundRoute extends React.Component<i18nProps> {
  render() {
    const { t } = this.props;

    return (
      <div className='ui text container'>
        <h1 className='ui header'>{t('errors.notFoundTitle')}</h1>
        <div className='content'>{t('errors.notFoundDescription')}</div>
      </div>
    );
  }
}

export default compose(
  translate('translations')
)(NotFoundRoute);

