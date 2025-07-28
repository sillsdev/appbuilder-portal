import * as _Requests from './requests.js';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BuildEngine {
  export const Requests = _Requests;
  // Re-export types by assigning them to the namespace
  export import Types = TypesNamespace;
}

import * as TypesNamespace from './types.js';
