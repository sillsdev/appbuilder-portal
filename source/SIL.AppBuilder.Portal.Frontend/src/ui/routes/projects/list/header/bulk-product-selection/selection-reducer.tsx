import { useReducer } from 'react';

const ADD = 'add';
const REMOVE = 'remove';
const TOGGLE = 'toggle';

export const add = (id) => ({ type: ADD, id });
export const remove = (id) => ({ type: REMOVE, id });
export const toggle = (id) => ({ type: TOGGLE, id });

export function reducer(state, action) {
  const { type, id } = action;
  switch (type) {
    case ADD:
      return state.concat(id);
    case REMOVE:
      return state.filter((productId) => productId !== id);
    case TOGGLE:
      if (state.includes(id)) {
        return state.filter((productId) => productId !== id);
      }

      return state.concat(id);
    default:
      return state;
  }
}

export function useSelectionManager() {
  const [selected, dispatch] = useReducer(reducer, []);

  return {
    selected,
    add(id: string) {
      dispatch(add(id));
    },
    remove(id: string) {
      dispatch(remove(id));
    },
    toggle(id: string) {
      dispatch(toggle(id));
    },
    isSelected(id: string) {
      return selected.includes(id);
    },
  };
}
