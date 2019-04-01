export enum ALL_CHECKBOX_STATE {
  NONE = 'none',
  INDETERMINATE = 'indeterminate',
  ALL = 'all',
}

export const ROWS_DEFAULT_VALUE = [];
export const TOGGLE_DEFAULT_VALUE = ALL_CHECKBOX_STATE.NONE;

export function rowSelectionsFor(state, tableName) {
  const { data } = state;

  return (
    (data &&
      data.rowSelections &&
      data.rowSelections[tableName] &&
      data.rowSelections[tableName].rows) ||
    ROWS_DEFAULT_VALUE
  );
}

export function allCheckboxStateFor(state, tableName) {
  const { data } = state;

  return (
    (data &&
      data.rowSelections &&
      data.rowSelections[tableName] &&
      data.rowSelections[tableName].allCheckboxState) ||
    TOGGLE_DEFAULT_VALUE
  );
}
