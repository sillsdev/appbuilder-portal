import { namespace, State } from '../shared';

export const SET_ROW_SELECTION = `${namespace}/SET_ROW_SELECTION`;

export interface SetRowSelectionAction {
  type: string;
  payload: {
    tableName: string;
    rows: any[];
  };
}

export const setRowSelection = (tableName: string, rows: any[]): SetRowSelectionAction => ({
  type: SET_ROW_SELECTION,
  payload: {
    tableName,
    rows
  }
});

export const reducer = (state: State, action: SetRowSelectionAction) => {
  const { tableName, rows } = action.payload;

  return {
    ...state,
    rowSelections: {
      [tableName]: {
        ...state.rowSelections[tableName],
        rows
      }
    }
  };
};