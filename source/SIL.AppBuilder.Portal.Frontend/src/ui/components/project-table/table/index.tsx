import * as React from 'react';
import { compose } from 'recompose';

import { ProjectResource } from '@data';
import { ISortProps } from '@data/containers/api/sorting';

import { IProvidedProps as ITableColumns } from './with-table-columns';
import Header from './header';
import Row from './row';
import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';
import LoadingWrapper from '@ui/components/loading-wrapper';

interface IOwnProps {
  projects: ProjectResource[];
  isLoading?: boolean;
  projectPath?: (id: string) => string;
}

type IProps =
  & IOwnProps
  & ITableColumns
  & ISortProps
  & i18nProps;

class Table extends React.Component<IProps> {

  render() {

    const {
      projects,
      selectedColumns,
      activeProjectColumns,
      activeProductColumns,
      t,
      isLoading,
      projectPath,
    } = this.props;

    const isProjectListEmpty = isEmpty(projects);

    let projectList;

    if (isProjectListEmpty) {
      projectList = <div data-test-project-list-empty>{t('projectTable.empty')}</div>;
    } else {
      projectList = (
        <>
          <Header {...this.props} />
          {
            projects.map((project, index) => {

              const rowProps = {
                project,
                selectedColumns,
                activeProjectColumns,
                activeProductColumns,
                projectPath,
              };

              return <Row key={index} {...rowProps} />;
            })
          }
        </>
      );
    }

    return (
      <LoadingWrapper
        data-test-project-table
        isLoading={isLoading}
        className='project-table'>
        {projectList}
      </LoadingWrapper>
    );
  }

}

export default compose(
  withTranslations
)(Table);
