export const namespace = 'sil';

export interface State {
  isSidebarVisible: boolean,
  activeMenu: string
}

export const initialState: State = {
  isSidebarVisible: false,
  activeMenu: 'tasks'
};


