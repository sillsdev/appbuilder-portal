import * as pick from 'lodash/pick';

export interface IAttributeProps {
  className: string;
}

export const GENERIC_ATTRIBUTES = [
  'className'
];


export function filterForValidAttributes(input: object) {
  return pick(input, GENERIC_ATTRIBUTES);
}
