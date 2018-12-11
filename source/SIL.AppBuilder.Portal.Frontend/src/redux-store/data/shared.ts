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
    [tableName: string]: {
      rows: any[];
      allCheckboxState: string;
    }
  };
}

export const initialState: State = {
  currentOrganizationId: '',
  columnSelections: {},
  rowSelections: {}
};
