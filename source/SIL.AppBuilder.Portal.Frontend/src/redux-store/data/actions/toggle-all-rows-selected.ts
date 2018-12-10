import { namespace, State } from '../shared';

export const TOGGLE_ALL_ROW_SELECTED = `${namespace}/TOGGLE_ALL_ROW_SELECTED`;

export interface ToggleAllRowSelectedAction {
  type: string;
  payload: {
    tableName: string;
  };
}

export const toggleAllRowSelected = (tableName: string): ToggleAllRowSelectedAction => ({
  type: TOGGLE_ALL_ROW_SELECTED,
  payload: {
    tableName
  }
});

export const reducer = (state: State, action: ToggleAllRowSelectedAction) => {
  const { tableName } = action.payload;
  return {
    ...state,
    allRowsSelected: {
      [tableName]: !state.allRowsSelected[tableName]
    }
  };
};