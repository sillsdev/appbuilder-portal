import { RecordNotFoundException, ClientError } from '@orbit/data';
import { isEmpty } from '@lib/collection';
import { GenericJsonApiError } from '~/data/errors/generic-jsonapi-error';

export interface ParsedError {
  title: string;
  body?: string | string[];
}

function getJSONAPIErrors(error) {
  const onData = (error.data && error.data.errors);

  const specCompliant = error.errors;

  return onData || specCompliant || [];
}

function getFirstJSONAPIError(error) {
  return getJSONAPIErrors(error)[0] || {};
}

function getFirstJSONAPIErrorMessage(error) {
  return getFirstJSONAPIError(error).detail;
}

export function parseError(error: any): ParsedError {
  if (typeof error === 'string') {
    return {
      title: error,
      body: undefined,
    };
  }

  if (error instanceof RecordNotFoundException) {
    return {
      title: error.description,
      body: error.message,
    };
  }

  if (error instanceof ClientError) {
    const maybeJsonApiError = getFirstJSONAPIError(error);

    if (Object.keys(maybeJsonApiError).length > 0) {
      return { title: maybeJsonApiError.title, body: maybeJsonApiError.detail };
    }

    return {
      title: error.description,
      body: error.message,
    };
  }

  if (error instanceof GenericJsonApiError) {
    error = error.json;
  }

  const jsonApiError = getFirstJSONAPIErrorMessage(error);

  if (jsonApiError) {
    return { title: jsonApiError };
  }

  const title = error.message || error;
  const body = undefined;

  return { title, body };
}
