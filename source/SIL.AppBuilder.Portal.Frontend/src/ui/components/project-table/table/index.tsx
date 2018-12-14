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

import { IProvidedProps as ITableRows } from './with-table-rows';

interface IOwnProps {
  projects: ProjectResource[];
  isLoading?: boolean;
  projectPath?: (id: string) => string;
  showSelection?: boolean;
  showProjectActions?: boolean;
}

type IProps =
  & IOwnProps
  & ITableColumns
  & ITableRows
  & ISortProps
  & i18nProps;

class Table extends React.Component<IProps> {

  static defaultProps = {
    showProjectActions: true
  };

  render() {
    const {
      projects,
      selectedColumns,
      activeProjectColumns,
      activeProductColumns,
      t,
      isLoading,
      projectPath,
      selectedRows,
      toggleRowSelection,
      showSelection,
      showProjectActions
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
                selectedRows,
                toggleRowSelection,
                showSelection,
                showProjectActions
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
