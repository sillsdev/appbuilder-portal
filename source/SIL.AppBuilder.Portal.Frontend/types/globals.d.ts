import { Store } from "redux";

export {}; // this file needs to be a module?

declare global {
  interface Window {
    devToolsExtension: any;
    __store__: Store;
    $: JQueryStatic;
    jQuery: JQueryStatic;
  }

  interface Global {
    window: Window;
    document: Document;
    navigator: Navigator;
  }
}
