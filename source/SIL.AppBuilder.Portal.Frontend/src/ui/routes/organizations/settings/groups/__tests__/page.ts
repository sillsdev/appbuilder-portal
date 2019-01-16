import { clickable, text, fillable, collection, interactor, Interactor } from '@bigtest/interactor';

class Groups {
  clickAddGroupButton = clickable('[data-test-org-add-group-button]');
  fillName = fillable('[data-test-org-group-form-name]');
  fillAbbreviation = fillable('[data-test-org-group-form-abbreviation]');
  clickSaveButton = clickable('[data-test-org-group-form-save]');
  groupNameList = collection('[data-test-org-edit-group-button]');
  deleteButtonList = collection('[data-test-org-delete-button]');
  emptyLabel = text('[data-test-org-groups-empty]');
}

export const GroupsInteractor = interactor(Groups);
export type TInteractor = Groups & Interactor;

export default new (GroupsInteractor as any)('[data-test-org-groups]') as TInteractor;
