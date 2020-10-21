import { interactor, Interactor, collection, text, clickable, hasClass } from '@bigtest/interactor';

class TransitionDetailsModalInteractor {
  static defaultScope = '[data-test-transitions-modal]';

  isVisible = hasClass('visible');
  closePopup = clickable('[data-test-transition-details-close]');
  details = collection('[data-test-transition-details-record]', {
    state: text('[data-test-transition-state] span'),
    user: text('[data-test-transition-user] span'),
    command: text('[data-test-transition-command] span'),
    comment: text('[data-test-transition-comment] span'),
    commentLink: text('[data-test-transition-comment] a'),
  });

  detailNamed(named: string) {
    const detail = this.details().find((d) => d.state.includes(named));

    if (!detail) {
      throw new Error(`cannot find transition detail named: ${named}`);
    }

    return detail;
  }
}
export type TAddTransitionDetailsModalInteractor = typeof TransitionDetailsModalInteractor &
  Interactor;
const i: TAddTransitionDetailsModalInteractor = interactor(TransitionDetailsModalInteractor);

export default i as TAddTransitionDetailsModalInteractor;
