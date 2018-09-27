import {
  interactor,
  clickable,
  collection,
  text,
  isPresent,
} from '@bigtest/interactor';

@interactor
export class ProjectTableInteractor {
  constructor(selector?: string) { }

  clickColumnSelector = clickable('[data-test-project-table-columns-selector]');
  selectedItems = collection('[data-test-project-table-columns-selector-item].checked');
  clickOwnerColumn = clickable('[data-test-project-table-columns-selector-item]:first-child');
  clickOrganizationColumn = clickable('[data-test-project-table-columns-selector-item]:nth-child(2)');
  selectorItems = collection('[data-test-project-table-columns-selector-item]');
  columns = collection('[data-test-project-table-column]');
  isEmptyTextPresent = isPresent('[data-test-project-list-empty]');
  emptyText = text('[data-test-project-list-empty]');
}

export default new ProjectTableInteractor('[data-test-project-table]');
