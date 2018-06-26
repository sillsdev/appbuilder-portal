import { combineReducers } from 'redux';

import {
  reducer as todosReducer,
  State as TodoState
} from './todos';

export interface State{
  todos: TodoState;
}

export const reducers = combineReducers({
  todos: todosReducer
});
