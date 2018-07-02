import { namespace, State } from '../shared';

export const SET_ACTIVE_MENU = `${namespace}/SET_ACTIVE_MENU`;
export interface SetActiveMenuAction { type: string; menu: string; }

// Action Creator
export const setActiveMenu = (menu: string): SetActiveMenuAction => ({ type: SET_ACTIVE_MENU, menu });

// Reducer
export const reducer = (state: State, action: SetActiveMenuAction) => ({
  ...state,
  activeMenu: action.menu
});