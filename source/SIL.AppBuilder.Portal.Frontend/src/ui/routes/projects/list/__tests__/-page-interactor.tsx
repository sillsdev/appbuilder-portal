import {
  interactor,
  Interactor,
  hasClass,
  clickable,
  collection,
  text,
  scoped,
  isPresent,
} from '@bigtest/interactor';
import ProjectTable from '@ui/components/project-table/__tests__/page';

import ProjectActionHeader from './-header-interactor';

@interactor
class ProjectListPage {
  constructor(selector?: string) {}
  static defaultScope = '[data-test-project-list]';
  actionHeader = scoped(ProjectActionHeader.defaultScope, ProjectActionHeader);
  projectTable = scoped(ProjectTable.defaultScope, ProjectTable);
}

export default ProjectListPage;
