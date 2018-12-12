// tslint:disable:max-classes-per-file

import {
  clickable,
  fillable,
  scoped,
  interactor,
  Interactor
} from '@bigtest/interactor';

class AddUserModalInteractor {
  enterEmail = fillable('[data-test-email]');
  submit = clickable('[data-test-add]');
  hasError(like: string) : boolean {
    const error = this.scoped('[data-test-error]');
    if (!error.isPresent){ return false; }
    const likeRegex = new RegExp(like);
    return likeRegex.test(error.text);
  }
}

const i = interactor(AddUserModalInteractor);
export type TAddUserModalInteractor = AddUserModalInteractor & Interactor;
export default new i('[data-test-users-adduser-modal]') as TAddUserModalInteractor;
