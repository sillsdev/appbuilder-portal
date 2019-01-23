import { RecordNotFoundException, ClientError } from '@orbit/data';
import { isEmpty } from '@lib/collection';

export interface ParsedError {
  title: string;
  body?: string | string[];
}

function getJSONAPIErrors(error) {
  return (error.data && error.data.errors) || [];
}

function getFirstJSONAPIError(error) {
  return getJSONAPIErrors(error)[0] || {};
}

function getFirstJSONAPIErrorMessage(error) {
  return getFirstJSONAPIError(error).detail;
}

export function parseError(error: any): ParsedError {
  if (error instanceof RecordNotFoundException) {
    return {
      title: error.description,
      body: error.message,
    };
  }

  if (error instanceof ClientError) {
    const maybeJsonApiError = getFirstJSONAPIError(error);

    if (!isEmpty(maybeJsonApiError)) {
      return { title: maybeJsonApiError.title, body: maybeJsonApiError.detail };
    }

    return {
      title: error.description,
      body: error.message,
    };
  }

  const jsonApiError = getFirstJSONAPIErrorMessage(error);

  if (jsonApiError) {
    return { title: jsonApiError };
  }

  const title = error.message || error;
  const body = undefined;

  return { title, body };
}
