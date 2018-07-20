export interface ParsedError {
  title: string;
  body?: string | string[];
}

export function parseError(error: any): ParsedError {
  const title = error.message || error;
  const body = undefined;


  return { title, body };
}
