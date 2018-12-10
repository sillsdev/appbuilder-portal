export const namespace = 'sil/data';

export interface Column {
  id: string;
  type: string;
}

export interface State {
  currentOrganizationId: string;
  columnSelections: {
    [tableName: string]: Column[];
  };
  rowSelections: {
    [tableName: string]: any[];
  };
  allRowsSelected: {
    [tableName: string]: boolean;
  };
}

export const initialState: State = {
  currentOrganizationId: '',
  columnSelections: {},
  rowSelections: {},
  allRowsSelected: {}
};
