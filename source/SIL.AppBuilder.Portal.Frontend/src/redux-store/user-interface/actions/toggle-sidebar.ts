import { namespace, State } from '../shared';

export const TOGGLE_SIDEBAR = `${namespace}/TOGGLE_SIDEBAR`;
export interface toggleSidebarAction { type: string; }

// Action Creator
export const toggleSidebar = (): toggleSidebarAction => ({ type: TOGGLE_SIDEBAR });

// Reducer
export const reducer = (state: State, action: toggleSidebarAction) => ({
  ...state,
  isSidebarVisible: !state.isSidebarVisible
});