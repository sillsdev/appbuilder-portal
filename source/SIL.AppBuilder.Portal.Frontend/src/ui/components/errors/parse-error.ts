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

  const errorDetail = error.data && error.data.errors && error.data.errors.length > 0 && error.data.errors[0].detail;
  
  if( errorDetail ) {
    return {
      title: errorDetail
    };
  }

  const title = error.message || error;
  const body = undefined;


  return { title, body };
}
