import { namespace, State } from '../shared';

export const SET_ALL_CHECKBOX_STATE = `${namespace}/SET_ALL_CHECKBOX_STATE`;

export interface SetAllCheckboxStateAction {
  type: string;
  payload: {
    tableName: string;
    allCheckboxState: string;
  };
}

export const setAllCheckboxState = (
  tableName: string,
  allCheckboxState: string
): SetAllCheckboxStateAction => ({
  type: SET_ALL_CHECKBOX_STATE,
  payload: {
    tableName,
    allCheckboxState,
  },
});

export const reducer = (state: State, action: SetAllCheckboxStateAction) => {
  const { tableName, allCheckboxState } = action.payload;

  return {
    ...state,
    rowSelections: {
      [tableName]: {
        ...state.rowSelections[tableName],
        allCheckboxState,
      },
    },
  };
};
