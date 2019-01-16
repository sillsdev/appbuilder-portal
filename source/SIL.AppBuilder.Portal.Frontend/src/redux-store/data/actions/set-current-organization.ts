import { namespace, State } from '../shared';

export const SET_CURRENT_ORGANIZATION = `${namespace}/SET_CURRENT_ORGANIZATION`;
export interface SetCurrentOrganizationAction {
  type: string;
  id: string;
}

// Action Creator
export const setCurrentOrganization = (id: string): SetCurrentOrganizationAction => ({
  type: SET_CURRENT_ORGANIZATION,
  id,
});

// Reducer
export const reducer = (state: State, action: SetCurrentOrganizationAction) => ({
  ...state,
  currentOrganizationId: action.id,
});
