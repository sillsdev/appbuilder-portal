import { respondWithJsonApi } from './jsonapi';

export const mockGet = server => (status: number, path: string, jsonapiPayload: {}) => {
  server.namespace('/api', () => {
    server.get(path).intercept(respondWithJsonApi(status, jsonapiPayload));
  });
};
