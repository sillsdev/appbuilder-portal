import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';
import ProjectTable from '@ui/components/project-table';
import Filters from './filters';

export const pathName = '/directory';

class ProjectDirectoryRoute extends React.Component<i18nProps> {

  render() {
    const { t } = this.props;

    return (
      <div className='ui container'>
        <div className='flex-row justify-content-space-between align-items-center'>
          <h2 className='page-heading'>{t('directory.title', { numProjects: 0 })}</h2>

          <div className="ui search">
            <div className="ui left icon input search-component ">
              <input type="text" placeholder={`${t('common.search')}...`} />
              <i className="search icon" />
            </div>
          </div>
        </div>
        <Filters />
        <ProjectTable />
      </div>
    );
  }
}

export default compose (
  translate('translations'),
  requireAuth,
  withLayout,
)(ProjectDirectoryRoute);
