import { initialState } from './shared';

import {
  SetCurrentOrganizationAction, SET_CURRENT_ORGANIZATION,
  reducer as setOrgReducer
} from './actions/set-current-organization';

export { State } from './shared';
export { setCurrentOrganization } from './actions/set-current-organization';

type ActionTypes =
  | SetCurrentOrganizationAction;

const actionHandlers = {
  [SET_CURRENT_ORGANIZATION]: setOrgReducer
};

export function reducer(state = initialState, action: ActionTypes) {
  const handler = actionHandlers[action.type];

  return handler ? handler(state, action as any) : state;
}
