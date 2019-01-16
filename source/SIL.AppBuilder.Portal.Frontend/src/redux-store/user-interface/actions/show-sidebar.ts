import { namespace, State } from '../shared';

export const SHOW_SIDEBAR = `${namespace}/SHOW_SIDEBAR`;
export interface ShowSidebarAction {
  type: string;
}

// Action Creator
export const showSidebar = (): ShowSidebarAction => ({ type: SHOW_SIDEBAR });

// Reducer
export const reducer = (state: State, action: ShowSidebarAction) => ({
  ...state,
  isSidebarVisible: true,
});
