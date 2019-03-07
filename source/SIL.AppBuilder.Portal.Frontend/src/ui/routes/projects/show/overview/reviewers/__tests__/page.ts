import {
  interactor,
  clickable,
  text,
  isPresent,
  fillable,
  count,
  collection,
  value,
} from '@bigtest/interactor';
import localeSelectInteractor from '@ui/components/inputs/locale-select/__tests__/page';

@interactor
export class ReviewerInteractor {
  constructor(selector?: string) {}

  list = collection('[data-test-project-reviewer-item-text]');
  listCount = count('[data-test-project-reviewer-item]');

  clickAddFormToggler = clickable('[data-test-project-reviewers-toggler]');
  isAddFormPresent = isPresent('[data-test-project-reviewers-add-form]');

  fillReviewerName = fillable('[data-test-project-reviewers-add-form-name]');
  fillReviewerEmail = fillable('[data-test-project-reviewers-add-form-email]');
  clickAddReviewerSubmitButton = clickable('[data-test-project-reviewers-add-form-submit]');

  clickRemoveReviewer = clickable('[data-test-project-reviewers-remove-item]:first-child');

  reviewerName = value('[data-test-project-reviewers-add-form-name]');
  reviewerEmail = value('[data-test-project-reviewers-add-form-email]');
  localeSelect = localeSelectInteractor;
}

export default new ReviewerInteractor('[data-test-project-reviewers]');
