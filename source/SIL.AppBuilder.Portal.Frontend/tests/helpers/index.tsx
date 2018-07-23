export { useFakeAuthentication } from './auth';
export { setupRequestInterceptor } from './request-intercepting/polly';
export { setupApplicationTest, mountWithContext } from './mounting';

export function wait(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
