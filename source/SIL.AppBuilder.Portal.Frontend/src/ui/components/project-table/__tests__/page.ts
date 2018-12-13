import {
  interactor,
  clickable,
  collection,
  text,
  isPresent,
  Interactor
} from '@bigtest/interactor';


class ProjectTable {
  constructor(selector?: string) { }

  clickColumnSelector = clickable('[data-test-project-table-columns-selector]');
  selectedItems = collection('[data-test-project-table-columns-selector-item].checked');
  clickOwnerColumn = clickable('[data-test-project-table-columns-selector-item]:first-child');
  clickOrganizationColumn = clickable('[data-test-project-table-columns-selector-item]:nth-child(2)');
  selectorItems = collection('[data-test-project-table-columns-selector-item]');
  columns = collection('[data-test-project-table-column]');
  isEmptyTextPresent = isPresent('[data-test-project-list-empty]');
  emptyText = text('[data-test-project-list-empty]');

  rows = collection('[data-test-project-row]', {
    isRowActionPresent: isPresent('[data-test-row-actions]');
  });

  isSortingUp = isPresent('[data-test-up-arrow]');
  isSortingDown = isPresent('[data-test-down-arrow]');

  clickColumn(this: Interactor, columnText: string) {
    return this
      .when(() => {
        const el = this
        .$$('[data-test-project-table-column]')
        .find(item => item.innerText.includes(columnText));

        if(!el) {
          throw new Error(`cannot find column with text "${columnText}"`);
        }

        return el;
      }).do(el => el.click());
  }
}

export const ProjectTableInteractor = interactor(ProjectTable);

export type TInteractor = ProjectTable & Interactor;

export default new (ProjectTableInteractor as any)('[data-test-project-table]') as TInteractor;
