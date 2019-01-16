import { State, initialState } from './shared';
import {
  SetCurrentOrganizationAction,
  SET_CURRENT_ORGANIZATION,
  reducer as setOrgReducer,
} from './actions/set-current-organization';
import {
  SetColumnSelectionAction,
  SET_COLUMN_SELECTION,
  reducer as toggleColumnReducer,
} from './actions/set-column-selection';
import {
  SetRowSelectionAction,
  SET_ROW_SELECTION,
  reducer as setRowSelectionReducer,
} from './actions/set-row-selection';
import {
  SetAllCheckboxStateAction,
  SET_ALL_CHECKBOX_STATE,
  reducer as setAllCheckboxReducer,
} from './actions/set-all-checkbox-state';

export { State, Column, initialState } from './shared';
export { setCurrentOrganization } from './actions/set-current-organization';
export { setColumnSelection } from './actions/set-column-selection';
export { setRowSelection } from './actions/set-row-selection';
export { setAllCheckboxState } from './actions/set-all-checkbox-state';

type Handler = (state: State, action: ActionTypes) => State;

type ActionTypes =
  | SetCurrentOrganizationAction
  | SetColumnSelectionAction
  | SetRowSelectionAction
  | SetAllCheckboxStateAction;

const actionHandlers = {
  [SET_CURRENT_ORGANIZATION]: setOrgReducer,
  [SET_COLUMN_SELECTION]: toggleColumnReducer,
  [SET_ROW_SELECTION]: setRowSelectionReducer,
  [SET_ALL_CHECKBOX_STATE]: setAllCheckboxReducer,
};

export function reducer(state = initialState, action: ActionTypes) {
  const handler: Handler = actionHandlers[action.type];

  return handler ? handler(state, action as any) : state;
}
