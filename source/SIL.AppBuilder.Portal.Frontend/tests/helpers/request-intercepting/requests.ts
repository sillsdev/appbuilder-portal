import { respondWithJsonApi } from './jsonapi';
import { DBConnection } from 'auth0-js';
import { custom } from '@lib/toast';

type CustomizeCallback = (server, req, res) => Promise<void>;

function bindCustomize(server, cb){
  if (cb){
    return cb.bind(undefined, server);
  }
  return undefined;
}

export const mockGet = server => (status: number, path: string, jsonapiPayload: {}, customize?: CustomizeCallback) => {
  server.namespace('/api', async () => {
    await server.get(path).intercept(respondWithJsonApi(status, jsonapiPayload, bindCustomize(server, customize)));
  });
};

export const mockPatch = server =>  (status: number, path: string, jsonapiPayload: {}, customize?: CustomizeCallback) => {
  server.namespace('/api', async () => {
    await server.patch(path).intercept(respondWithJsonApi(status, jsonapiPayload, bindCustomize(server, customize)));
  });
};

export const mockPost = server =>  async (status: number, path: string, jsonapiPayload: {}, customize?: CustomizeCallback) => {
  server.namespace('/api', async () => {
    await server.post(path).intercept(respondWithJsonApi(status, jsonapiPayload, bindCustomize(server, customize)));
  });
};

export const mockDelete = server => (status: number, path: string, customize?: CustomizeCallback) => {
  server.namespace('/api', () => {
    server.delete(path).intercept(async (req,res) => {
      if (customize){
        await customize(server, req, res);
      }
      res.status(status);
    });
  });
};
