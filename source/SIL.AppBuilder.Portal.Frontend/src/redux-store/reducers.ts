import { combineReducers } from 'redux';

import { reducer as uiReducer, State as UIState, initialState as uiState } from './user-interface';
import { reducer as dataReducer, State as DataState, initialState as dataState } from './data';

export interface State {
  ui: UIState;
  data: DataState;
}

export const APP_RESET = 'sil/APP_RESET';
export const DEFAULT_STATE = {
  ui: uiState,
  data: dataState,
};

export const reducers = (state: State, action: any): State => {
  // default state can't be empty, due to how the state is accessed throughout the app
  // (no emptiness checking)
  if (action.type === APP_RESET) {
    return DEFAULT_STATE;
  }

  return combineReducers({
    ui: uiReducer,
    data: dataReducer,
  })(state, action);
};
