// The language chooser relies on browser APIs (via @ethnolib/find-language)
// and is not SSR-compatible. Disable SSR for this route, matching the approach
// used by the ethnolib demo app (adapter-static with SPA fallback).
export const ssr = false;
