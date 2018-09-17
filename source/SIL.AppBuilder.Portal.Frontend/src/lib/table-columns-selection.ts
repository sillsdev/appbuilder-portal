const storageKey = 'table-columns-selection';

// Usage:
// [
//   'directory': 'name,owner,organization',
//   'my-project': 'name,group,build'
// ]
const getSelections = () => {
  const raw = localStorage.getItem(storageKey);
  try {
    return JSON.parse(raw) || [];
  } catch(e) {
    console.error(e);
  }
  return [];
};

const setSelections = (selections) => {
  localStorage.setItem(storageKey,JSON.stringify(selections));
};

export function getTableColumnsSelection(key:string): string {
  const tableColumnsSelections = getSelections();
  return tableColumnsSelections[key] || '';
}

export function setTableColumnsSelection(key:string, selection:string) {
  const selections = getSelections();
  selections[key] = selection;
  setSelections(selections);
}