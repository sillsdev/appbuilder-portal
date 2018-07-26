export { useFakeAuthentication } from './auth';
export { setupRequestInterceptor } from './request-intercepting/polly';
export { respondWithJsonApi } from './request-intercepting/jsonapi';
export { setupApplicationTest, mountWithContext } from './mounting';

export { mockGet } from './request-intercepting/requests';

export function wait(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
