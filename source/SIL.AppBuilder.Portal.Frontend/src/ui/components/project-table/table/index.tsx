import * as React from 'react';
import { isEmpty } from '@lib/collection';
import { useTranslations } from '@lib/i18n';
import LoadingWrapper from '@ui/components/loading-wrapper';

import Header from './header';
import Row from './row';

export default function Table(props) {
  let {
    projects,
    selectedColumns,
    activeProjectColumns,
    activeProductColumns,
    isLoading,
    projectPath,
    selectedRows,
    toggleRowSelection,
    showSelection,
    showProjectActions,
  } = props;

  const { t } = useTranslations();
  const isProjectListEmpty = isEmpty(projects);

  let projectList;

  if (isProjectListEmpty) {
    projectList = <div data-test-project-list-empty>{t('projectTable.empty')}</div>;
  } else {
    showProjectActions = showProjectActions !== undefined ? showProjectActions : true;

    projectList = (
      <>
        <Header {...props} />
        {projects.map((project) => {
          return (
            <Row
              key={project.id}
              {...{
                project,
                selectedColumns,
                activeProjectColumns,
                activeProductColumns,
                projectPath,
                selectedRows,
                toggleRowSelection,
                showSelection,
                showProjectActions,
              }}
            />
          );
        })}
      </>
    );
  }

  return (
    <LoadingWrapper data-test-project-table isLoading={isLoading} className='project-table'>
      {projectList}
    </LoadingWrapper>
  );
}
