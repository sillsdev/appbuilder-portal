import { all } from 'redux-saga/effects';

// other 'all' sagas go here
// e.g.:
// import { sagas as allTodoSagas } from './todos';
// ...
//
// export function * sagas() {
//   yield all([
//   ...allTodoSagas,
//   ...allOtherSagas
//   ]);
// }
//
// the exported sagas object from the top-level
// domain concept should simply be an array of sagas
//
// see https://github.com/redux-saga/redux-saga/issues/160
// for performance discussion, and why all([flat list])
// uses less memory
export function * sagas() {
  yield all([
  ]);
}
