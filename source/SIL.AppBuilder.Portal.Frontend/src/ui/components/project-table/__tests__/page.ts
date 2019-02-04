import { assert } from 'chai';
import {
  interactor,
  attribute,
  clickable,
  collection,
  text,
  isPresent,
  hasClass,
  Interactor,
  scoped,
} from '@bigtest/interactor';
import { find } from 'lodash';

import { attributesFor } from '~/data';
// tslint:disable:max-classes-per-file

class ProjectRow {
  constructor(selector?: string) {}
  static defaultScope = '[data-test-project-row]';
  isRowActionPresent = isPresent('[data-test-row-actions]');
  select = clickable('[data-test-selector]');
  isSelected = hasClass('[data-test-selector]', 'checked');
  projectId = attribute('data-test-project-row');
  text = text();
}

export const ProjectRowInteractor = interactor(ProjectRow);

class ProjectTable {
  constructor(selector?: string) {}
  static defaultScope = '[data-test-project-table]';
  clickColumnSelector = clickable('[data-test-project-table-columns-selector]');
  selectedItems = collection('[data-test-project-table-columns-selector-item].checked');
  clickOwnerColumn = clickable('[data-test-project-table-columns-selector-item]:first-child');
  clickOrganizationColumn = clickable(
    '[data-test-project-table-columns-selector-item]:nth-child(2)'
  );
  selectorItems = collection('[data-test-project-table-columns-selector-item]');
  columns = collection('[data-test-project-table-column]');
  isEmptyTextPresent = isPresent('[data-test-project-list-empty]');
  emptyText = text('[data-test-project-list-empty]');

  rows = collection(ProjectRowInteractor.defaultScope, ProjectRowInteractor);

  isSortingUp = isPresent('[data-test-up-arrow]');
  isSortingDown = isPresent('[data-test-down-arrow]');

  columnSelector = scoped('[data-test-project-table-columns-selector]', {
    isOpen: hasClass('.menu.columns', 'visible'),
    toggle: clickable(),

    options: collection('[data-test-project-table-columns-selector-item]', {
      isChecked: hasClass('checked'),
      toggle: clickable('input'),
    }),

    async toggleColumn(columnName: string) {
      if (!this.isOpen) {
        await this.toggle();
      }

      let options = this.options();
      let matchingColumnName = options.find((o) => o.text.includes(columnName));

      if (!matchingColumnName) {
        throw new Error(`cannot find option with text "${columnName}"`);
      }

      await matchingColumnName.toggle();
      await this.when(() =>
        assert(!this.isOpen, `expected column selector to close after selecting "${columnName}"`)
      );
    },
  });

  clickColumn(this: Interactor, columnText: string) {
    return this.when(() => {
      const el = this.$$('[data-test-project-table-column]').find((item) =>
        item.innerText.includes(columnText)
      );

      if (!el) {
        throw new Error(`cannot find column with text "${columnText}"`);
      }

      return el;
    }).do((el) => el.click());
  }

  rowForProjectId(projectId: number) {
    return find(this.rows(), (r) => parseInt(r.projectId, 10) === projectId);
  }
}

export const ProjectTableInteractor = interactor(ProjectTable);

export type TInteractor = ProjectTable & Interactor;

export default ProjectTableInteractor;
