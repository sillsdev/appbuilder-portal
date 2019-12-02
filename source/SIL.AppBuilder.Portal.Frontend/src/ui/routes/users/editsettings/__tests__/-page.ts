import { interactor, Interactor } from '@bigtest/interactor';

import GroupTabModalInteractor from './-group-tab';
import RoleTabModalInteractor from './-role-tab';

export class EditSettingsPageInteractor {
  constructor() {}
  groupTab = new GroupTabModalInteractor('[data-test-group-tab]');
  roleTab = new RoleTabModalInteractor('[data-test-role-tab]');
}

const i = interactor(EditSettingsPageInteractor);
export type TEditSettingsPageInteractor = EditSettingsPageInteractor & Interactor;
export default new i('[data-test-editsettings-manager]') as TEditSettingsPageInteractor;
