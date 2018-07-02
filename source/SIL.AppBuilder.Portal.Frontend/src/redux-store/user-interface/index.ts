import { initialState } from './shared';

import { ToggleSidebarAction, TOGGLE_SIDEBAR, reducer as toggleReducer } from './actions/toggle-sidebar';
import { SetActiveMenuAction, SET_ACTIVE_MENU, reducer as activeMenuReducer, setActiveMenu } from './actions/set-active-menu';

export { State } from './shared';
export { toggleSidebar } from './actions/toggle-sidebar';
export { setActiveMenu } from './actions/set-active-menu';

type ActionTypes =
  | ToggleSidebarAction
  | SetActiveMenuAction;

const actionHandlers = {
  [TOGGLE_SIDEBAR]: toggleReducer,
  [SET_ACTIVE_MENU]: activeMenuReducer
};

export function reducer(state = initialState, action: ActionTypes) {
  const handler = actionHandlers[action.type];

  return handler ? handler(state, action as any) : state;
}
