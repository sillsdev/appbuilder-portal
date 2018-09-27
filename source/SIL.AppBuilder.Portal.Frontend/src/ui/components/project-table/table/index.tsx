import * as React from 'react';
import { compose } from 'recompose';

import { ResourceObject } from 'jsonapi-typescript';

import { PROJECTS_TYPE } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { ISortProps } from '@data/containers/api/sorting';

import { IProvidedProps as ITableColumns } from './with-table-columns';
import Header from './header';
import Row from './row';
import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  projects: Array<ResourceObject<PROJECTS_TYPE, ProjectAttributes>>;
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
      t
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
                activeProductColumns
              };

              return <Row key={index} {...rowProps} />;
            })
          }
        </>
      );
    }

    return (
      <div data-test-project-table className='project-table'>
        {projectList}
      </div>
    );
  }

}

export default compose(
  withTranslations
)(Table);
