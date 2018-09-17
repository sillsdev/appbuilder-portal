import { namespace, State, Column } from '../shared';

export const SET_COLUMN_SELECTION = `${namespace}/SET_COLUMN_SELECTION`;

export interface SetColumnSelectionAction {
  type: string;
  payload: {
    tableName: string;
    columns: Column[];
  };
}

// Action Creator
export const setColumnSelection = (tableName: string, columns: Column[]): SetColumnSelectionAction => ({
  type: SET_COLUMN_SELECTION,
  payload: {
    tableName,
    columns
  }
});

// Reducer
export const reducer = (state: State, action: SetColumnSelectionAction) => {

  return {
    ...state,
    columnSelections: {
      [action.payload.tableName]: action.payload.columns
    }
  };

};