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

export const reducers = combineReducers({
  ui: uiReducer,
  data: dataReducer,
});
