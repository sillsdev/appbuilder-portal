import * as React from 'react';
import { compose, withProps } from 'recompose';
import { query, buildOptions, withLoader, SystemStatusResource, attributesFor } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compareVia } from '@lib/collection';

import BuildEngineItem from './item';

interface IOwnProps {
  buildEngines: SystemStatusResource[];
}

type IProps = IOwnProps & i18nProps & RouteComponentProps<{}>;

class ListBuildEngine extends React.Component<IProps> {
  render() {
    const { t, buildEngines } = this.props;

    return (
      <>
        <h2 className='sub-page-heading'>{t('admin.settings.buildEngines.title')}</h2>
        <div className='m-b-xxl'>
          {buildEngines.map((buildEngine) => (
            <BuildEngineItem key={buildEngine.id} buildEngine={buildEngine} />
          ))}
        </div>
      </>
    );
  }
}

export default compose(
  withTranslations,
  withRouter,
  query(() => ({
    buildEngines: [(q) => q.findRecords('systemStatus'), buildOptions()],
  })),
  withLoader(({ buildEngines }) => !buildEngines),
  withProps(({ buildEngines }) => ({
    buildEngines: buildEngines.sort(
      compareVia((be) => attributesFor(be).buildEngineUrl.toLowerCase())
    ),
  }))
)(ListBuildEngine);
