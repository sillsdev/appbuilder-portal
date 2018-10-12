import {
  interactor,
  clickable,
  text,
  selectable,
  value,
  fillable,
  isPresent,
  Interactor
} from '@bigtest/interactor';

class Range {
  toSet = fillable('[data-test-range-to] input');
  toValue = value('[data-test-range-to] input');
  toClearIsVisible = isPresent('[data-test-clear-to]');
  toClickClear = clickable('[data-test-clear-to]');

  fromValue = value('[data-test-range-from] input');
  fromSet = fillable('[data-test-range-from] input');
  fromClearIsVisible = isPresent('[data-test-clear-from]');
  fromClickClear = clickable('[data-test-clear-from]');
}

export const RangeInteractor = interactor(Range);
export type TInteractor = Range & Interactor;

export default new (RangeInteractor as any)('[data-test-range-input]') as TInteractor;
