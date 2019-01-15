import {
  Interactor,
  interactor, isPresent,
  clickable, fillable, value, selectable, text, collection
} from '@bigtest/interactor';

@interactor
export class Page {
  tableText = text('[data-test-tasks-table]');
  rows = collection('[data-test-row]');
  comments = collection('[data-test-comment');
}

export default (new (Page as any)('[data-test-tasks]')) as Page & Interactor;
