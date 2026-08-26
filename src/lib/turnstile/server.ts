import { SpanStatusCode, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('TurnstileVerification');

const TURNSTILE_TIMEOUT_MS = 5000;

export function resolveToken(formData: FormData) {
  const turnstileToken = formData.get('turnstileToken');
  const turnstileResponse = formData.get('cf-turnstile-response');

  if (
    (!turnstileToken || (typeof turnstileToken === 'string' && !turnstileToken.trim())) &&
    typeof turnstileResponse === 'string'
  ) {
    formData.set('turnstileToken', turnstileResponse.trim());
  }
}

export async function verifyToken(token: string, secret: string | undefined) {
  return tracer.startActiveSpan('Verify Turnstile Token', async (span) => {
    try {
      if (!secret) {
        span.recordException('Turnstile secret key is not configured');
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Turnstile secret key is not configured'
        });
        return 500;
      }

      let verification: Response;
      try {
        verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: new URLSearchParams({ secret, response: token }),
          signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS)
        });
      } catch (e) {
        span.recordException(e as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (e as Error).message
        });
        console.warn('Turnstile verification request failed', { error: e });
        return 503;
      }

      const result = await verification.json().catch(() => null);
      if (!verification.ok || !result || typeof result.success !== 'boolean') {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `Turnstile verification returned an invalid response: ${JSON.stringify(result)}`
        });
        console.warn('Turnstile verification returned an invalid response', {
          status: verification.status
        });
        return 502;
      }

      if (!result.success) {
        console.warn('Turnstile verification failed', {
          errorCodes: result['error-codes'],
          hostname: result.hostname,
          action: result.action
        });
        return 400;
      }

      return 200;
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
      console.warn('Turnstile verification request failed', { error: e });
      return 500;
    } finally {
      span.end();
    }
  });
}
