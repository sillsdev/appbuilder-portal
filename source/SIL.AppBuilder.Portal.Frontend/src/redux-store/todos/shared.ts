export const namespace = 'todos';

export interface Todo {
  text: string;
  id: number;
  completed: boolean;
}

export interface State {
  all: Todo[];
}

export const initialState: State = {
  all: [
    {
      id: -1,
      text: 'Redux',
      completed: false
    }
  ]
};

export interface OtherAction { type: ''; }
