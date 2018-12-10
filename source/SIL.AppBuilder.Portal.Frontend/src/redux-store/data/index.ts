import { State, initialState } from './shared';

import {
  SetCurrentOrganizationAction, SET_CURRENT_ORGANIZATION,
  reducer as setOrgReducer
} from './actions/set-current-organization';

import {
  SetColumnSelectionAction, SET_COLUMN_SELECTION,
  reducer as toggleColumnReducer
} from './actions/set-column-selection';

import {
  SetRowSelectionAction, SET_ROW_SELECTION,
  reducer as toggleRowReducer
} from './actions/set-row-selection';


export { State, Column } from './shared';
export { setCurrentOrganization } from './actions/set-current-organization';
export { setColumnSelection } from './actions/set-column-selection';

type Handler = (state: State, action: ActionTypes) => State;

type ActionTypes =
  | SetCurrentOrganizationAction
  | SetColumnSelectionAction
  | SetRowSelectionAction;

const actionHandlers = {
  [SET_CURRENT_ORGANIZATION]: setOrgReducer,
  [SET_COLUMN_SELECTION]: toggleColumnReducer,
  [SET_ROW_SELECTION]: toggleRowReducer
};

export function reducer(state = initialState, action: ActionTypes) {
  const handler: Handler = actionHandlers[action.type];

  return handler ? handler(state, action as any) : state;
}
