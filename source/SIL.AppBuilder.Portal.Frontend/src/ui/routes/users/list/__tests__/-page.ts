
import {
  clickable,
  interactor,
  Interactor,
  scoped
} from '@bigtest/interactor';

import UserTableInteractor from './-user-table';
import AddUserModalInteractor from './-add-user-modal';

export class UsersPageInteractor {
  constructor(selector?: string){}
  userTable = new UserTableInteractor();
  addUserModal = AddUserModalInteractor;
  addUser = clickable('[data-test-users-adduser-open]');
  addUserButton = scoped('[data-test-users-adduser-open]');
}

const i = interactor(UsersPageInteractor);
export type TUsersPageInteractor = UsersPageInteractor & Interactor;
export default new i('[data-test-manageusers]') as TUsersPageInteractor;
