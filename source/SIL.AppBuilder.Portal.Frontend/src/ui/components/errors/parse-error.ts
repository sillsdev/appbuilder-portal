import { RecordNotFoundException, ClientError } from '@orbit/data';

export interface ParsedError {
  title: string;
  body?: string | string[];
}

export function parseError(error: any): ParsedError {
  if (error instanceof RecordNotFoundException) {
    return {
      title: error.description,
      body: error.message
    };
  }

  if (error instanceof ClientError) {
    return {
      title: error.description,
      body: error.message
    };
  }

  const title = error.message || error;
  const body = undefined;


  return { title, body };
}
