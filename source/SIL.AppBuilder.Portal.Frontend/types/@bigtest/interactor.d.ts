export function interactor<T>(WrappedClass: T) : Interactor & T;
export function text(selector: string) : any;
export function clickable(selector: string): () => Promise<void>;
export function findAll(selector: string): HTMLElement[];
export function isPresent(selector: string): boolean;
export function selectable(selector: string): (text: string) => Promise<void>;
export function fillable(selector: string): (text: string) => Promise<void>;
export function isHidden(selector: string): boolean;
export function hasClass(selector: string, className: string): boolean;
export function collection(selector: string): () => HTMLElement[];
export function value(selector: string): string;
export function is(selector: string): boolean;

export class Interactor {
  constructor(selector?: string);

  $$(selector): this;
  when<T>(condition: (element?: HTMLElement) => T): this;

  do<T>(doFn: (element: Interactor) => void);

  click(selector?: string): Promise<void>;
  find(findFn: (element: HTMLElement) => boolean): HTMLElement;

}
