import { namespace, State } from '../shared';

export const TOGGLE_SIDEBAR = `${namespace}/TOGGLE_SIDEBAR`;
export interface ToggleSidebarAction { type: string; }

// Action Creator
export const toggleSidebar = (): ToggleSidebarAction => ({ type: TOGGLE_SIDEBAR });

// Reducer
export const reducer = (state: State, action: ToggleSidebarAction) => ({
  ...state,
  isSidebarVisible: !state.isSidebarVisible
});
