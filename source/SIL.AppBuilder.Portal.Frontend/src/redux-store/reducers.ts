import { combineReducers } from 'redux';

import {
  reducer as uiReducer,
  State as UIState
} from './user-interface';


import {
  reducer as dataReducer,
  State as DataState
} from './data';

export interface State {
  ui: UIState;
  data: DataState;
}

export const APP_RESET = 'sil/APP_RESET';

export const reducers = (state: State, action: any) => {
  if (action.type === APP_RESET) {
    return {};
  }

  return combineReducers({
    ui: uiReducer,
    data: dataReducer,
  })(state, action);
};
