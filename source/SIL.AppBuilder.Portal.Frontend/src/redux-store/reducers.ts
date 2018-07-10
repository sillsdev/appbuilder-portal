import { combineReducers } from 'redux';

import {
  reducer as uiReducer,
  State as UIState
} from './user-interface';

export interface State {
  ui: UIState;
}

export const reducers = combineReducers({
  ui: uiReducer
});
