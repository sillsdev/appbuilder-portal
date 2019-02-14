export type Mut = (field: string) => (e: Event) => void;
export type Toggle = (field: string) => (e: Event) => void;
export type Pipe = (actions: Function[]) => (e: Event) => void;

// https://github.com/NullVoxPopuli/react-state-helpers/blob/master/src/index.js
export function mutCreator(context: any): Mut;
export function toggleCreator(context: any): Toggle;
export function withValue<T>(fn: T): (e: any) => T;
