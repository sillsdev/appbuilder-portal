// tslint:disable:max-classes-per-file

import { clickable, fillable, scoped, interactor, Interactor } from '@bigtest/interactor';

class InviteUserModalInteractor {
  static defaultScope = '[data-test-users-invite-user-modal]';

  enterEmail = fillable('[data-test-email]');
  submit = clickable('[data-test-invite]');
  hasError(like: string): boolean {
    const error = this.scoped('[data-test-error]');

    if (!error.isPresent) {
      return false;
    }
    const likeRegex = new RegExp(like);

    return likeRegex.test(error.text);
  }
}
export type TAddUserModalInteractor = typeof InviteUserModalInteractor & Interactor;
const i: TAddUserModalInteractor = interactor(InviteUserModalInteractor);

export default i as TAddUserModalInteractor;
