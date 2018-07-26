export const namespace = 'sil/data';

export interface State {
  currentOrganizationId: string;
}

export const initialState: State = {
  currentOrganizationId: ''
};
