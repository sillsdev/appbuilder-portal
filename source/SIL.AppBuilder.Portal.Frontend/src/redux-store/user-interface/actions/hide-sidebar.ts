import { namespace, State } from '../shared';

export const HIDE_SIDEBAR = `${namespace}/HIDE_SIDEBAR`;
export interface HideSidebarAction {
  type: string;
}

// Action Creator
export const hideSidebar = (): HideSidebarAction => ({ type: HIDE_SIDEBAR });

// Reducer
export const reducer = (state: State, action: HideSidebarAction) => ({
  ...state,
  isSidebarVisible: false,
});
