import { initialState } from './shared';

import { toggleSidebarAction, TOGGLE_SIDEBAR, reducer as toggleReducer } from './actions/toggle-sidebar';

export { State } from './shared';
export { toggleSidebar } from './actions/toggle-sidebar';

type ActionTypes =
  | toggleSidebarAction;

const actionHandlers = {
  [TOGGLE_SIDEBAR]: toggleReducer
};

export function reducer(state = initialState, action: ActionTypes) {
  const handler = actionHandlers[action.type];

  return handler ? handler(state, action as any) : state;
}