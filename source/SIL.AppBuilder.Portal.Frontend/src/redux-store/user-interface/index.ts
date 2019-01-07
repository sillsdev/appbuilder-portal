import { initialState } from './shared';

import {
  ShowSidebarAction,
  SHOW_SIDEBAR,
  reducer as showReducer
} from './actions/show-sidebar';

import {
  HideSidebarAction,
  HIDE_SIDEBAR,
  reducer as hideReducer
} from './actions/hide-sidebar';

export { State, initialState } from './shared';
export { showSidebar } from './actions/show-sidebar';
export { hideSidebar } from './actions/hide-sidebar';

type ActionTypes =
  | ShowSidebarAction
  | HideSidebarAction;

const actionHandlers = {
  [SHOW_SIDEBAR]: showReducer,
  [HIDE_SIDEBAR]: hideReducer
};

export function reducer(state = initialState, action: ActionTypes) {
  const handler = actionHandlers[action.type];

  return handler ? handler(state, action as any) : state;
}
