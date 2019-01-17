import pickBy from 'lodash/pickBy';

// https://www.w3schools.com/tags/ref_attributes.asp
export interface IAttributeProps {
  accessKey?: string;
  contenteditable?: boolean;
  draggable?: boolean;
  dropzone?: string;
  className?: string;
  hidden?: boolean;
  dir?: string;
  id?: string;
  lang?: string;
  spellcheck?: boolean;
  style?: string | object;
  tabIndex?: string | number;
  title?: string;
  translate?: boolean;
  placeholder?: string;
}

export const GENERIC_ATTRIBUTES = [
  'accessKey',
  'contenteditable',
  'draggable',
  'dropzone',
  'className',
  'hidden',
  'dir',
  'role',
  'style',
  'id',
  'lang',
  'spellcheck',
  'tabIndex',
  'translate',
  'title',
  'placeholder',
];

export function filterForValidAttributes(input: object) {
  return pickBy(input, (_v, key) => {
    if (GENERIC_ATTRIBUTES.includes(key)) {
      return true;
    }

    return key.startsWith('data-') || key.startsWith('aria-');
  });
}
