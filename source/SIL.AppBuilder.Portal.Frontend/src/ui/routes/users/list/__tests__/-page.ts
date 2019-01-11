
import {
  clickable,
  interactor,
  Interactor,
  scoped,
  text
} from '@bigtest/interactor';

import UserTableInteractor from './-user-table';
import InviteUserModalInteractor from './-invite-user-modal';
import { text } from 'body-parser';

export class UsersPageInteractor {
  constructor(selector?: string){}
  userTable = new UserTableInteractor();
  inviteUserModal = new InviteUserModalInteractor('[data-test-users-invite-user-modal]');
  inviteUser = clickable('[data-test-users-invite-user-open]');
  inviteUserButton = scoped('[data-test-users-invite-user-open]');
  toastMessage = text('.toast-notification');
}

const i = interactor(UsersPageInteractor);
export type TUsersPageInteractor = UsersPageInteractor & Interactor;
export default new i('[data-test-manageusers]') as TUsersPageInteractor;
