import * as React from 'react';
import { compose } from 'recompose';
import { attributesFor, SystemStatusResource } from '@data';
import TimezoneLabel from '@ui/components/labels/timezone';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  buildEngine: SystemStatusResource;
}

type IProps = IOwnProps & i18nProps;

class BuildEngineItem extends React.Component<IProps> {
  render() {
    const { t, buildEngine } = this.props;

    const {
      buildEngineUrl,
      buildEngineApiAccessToken,
      systemAvailable,
      dateUpdated,
    } = attributesFor(buildEngine);
    let updatedSystemAvailable = systemAvailable === undefined ? false : systemAvailable;
    const status = updatedSystemAvailable
      ? t('admin.settings.buildEngines.connected')
      : t('admin.settings.buildEngines.disconnected');

    return (
      <div className='flex p-md fs-13 m-b-sm thin-border round-border-4'>
        <div className='flex-grow'>
          <div className='bold fs-16'>{buildEngineUrl}</div>
          <div className='p-t-md'>
            <span className='bold m-r-sm'>{t('admin.settings.buildEngines.accessToken')}:</span>
            <span>{buildEngineApiAccessToken}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>{t('admin.settings.buildEngines.status')}:</span>
            <span>{status}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>{t('admin.settings.buildEngines.lastUpdated')}:</span>
            <TimezoneLabel dateTime={dateUpdated} emptyLabel='--' />
          </div>
        </div>
      </div>
    );
  }
}

export default compose<IProps, IOwnProps>(withTranslations)(BuildEngineItem);
