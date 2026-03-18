export type PlayListingManifest = {
  url: string; // Base URL prefix where the listing files can be fetched from.
  icon: string; // Icon path (or URL) inside the listing bundle.
  color: string; // Brand color hex (e.g. "#1563ff")
  'default-language'?: string; // Default language tag for the listing bundle (e.g. "en-US").
  languages?: string[]; // Languages included in the bundle (language tags).
  files?: string[]; // Paths to files within the bundle (usually "<lang>/<file>.txt").
};

export type AppInfo = {
  id: string;
  icon: string | null;
  name: string;
  developer: string;
  themeColor: string | null;
  shortDesc: string;
  longDesc: string;
};

export type ArtifactRef = {
  Url: string | null;
};
