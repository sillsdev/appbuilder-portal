export const namespace = 'sil/data';

export interface Column {
  id: string,
  type: string;
}

export interface State {
  currentOrganizationId: string;
  columnSelections: {
    [tableName: string]: Array<Column>;
  };
}

export const initialState: State = {
  currentOrganizationId: '',
  columnSelections: {}
};
