import { Prisma } from '@prisma/client';
import { json } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import type { RequestHandler } from './$types';
import { DatabaseWrites } from '$lib/server/database';
import prisma from '$lib/server/database/prisma';
import { sendEmail } from '$lib/server/email-service/EmailClient';
import { EmailLayoutTemplate, addProperties } from '$lib/server/email-service/EmailTemplates';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TURNSTILE_TIMEOUT_MS = 5000;

interface DeleteRequestBody {
  email: string;
  token: string;
  productId: string;
  deletionType: 'data' | 'account';
}

function parseDeleteRequestBody(payload: unknown): DeleteRequestBody | null {
  if (!payload || typeof payload !== 'object') return null;

  const { email, token, productId, deletionType } = payload as Record<string, unknown>;
  if (
    typeof email !== 'string' ||
    typeof token !== 'string' ||
    typeof productId !== 'string' ||
    (deletionType !== 'data' && deletionType !== 'account')
  ) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedToken = token.trim();
  const normalizedProductId = productId.trim();

  if (
    !normalizedEmail ||
    !normalizedToken ||
    !normalizedProductId ||
    !EMAIL_PATTERN.test(normalizedEmail) ||
    !UUID_PATTERN.test(normalizedProductId)
  ) {
    return null;
  }

  return {
    email: normalizedEmail,
    token: normalizedToken,
    productId: normalizedProductId,
    deletionType
  };
}

export const POST: RequestHandler = async ({ locals, request }) => {
  // Security check
  locals.security.requireNothing();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ success: false }, { status: 400 });
  }

  const parsedBody = parseDeleteRequestBody(payload);
  if (!parsedBody) return json({ success: false }, { status: 400 });

  const { email: normalizedEmail, token, productId, deletionType } = parsedBody;
  const change =
    deletionType === 'account' ? 'Delete my account and all associated data' : 'Delete my data';

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('Turnstile secret key is not configured');
    return json({ success: false }, { status: 500 });
  }
  const formData = new URLSearchParams();

  formData.append('secret', secret);
  formData.append('response', token);

  let verification: Response;
  try {
    verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS)
    });
  } catch (error) {
    console.warn('Turnstile verification request failed', { error });
    return json({ success: false }, { status: 503 });
  }

  const result = await verification.json().catch(() => null);
  if (!verification.ok || !result || typeof result.success !== 'boolean') {
    console.warn('Turnstile verification returned an invalid response', {
      status: verification.status
    });
    return json({ success: false }, { status: 502 });
  }

  if (!result.success) {
    console.warn('Turnstile verification failed', {
      errorCodes: result['error-codes'],
      hostname: result.hostname,
      action: result.action
    });
    return json({ success: false }, { status: 400 });
  }

  // Generate a verification code and store it with an expiration time. This expiration time is 10 minutes, and is automatically reduced by a minute if the user types the wrong code to prevent brute-force attempts.
  const code = randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const now = new Date();

  let pendingRequestId: string;

  try {
    const pendingRequest = await prisma.$transaction(
      async (tx) => {
        const existingRequests = await tx.productUserChanges.findMany({
          where: {
            ProductId: productId,
            Email: normalizedEmail,
            DateConfirmed: null
          },
          orderBy: {
            DateCreated: 'desc'
          }
        });

        const [latestRequest, ...staleRequests] = existingRequests;
        if (staleRequests.length > 0) {
          await tx.productUserChanges.updateMany({
            where: {
              Id: {
                in: staleRequests.map((request) => request.Id)
              }
            },
            data: {
              DateUpdated: now,
              DateExpires: now
            }
          });
        }

        if (latestRequest) {
          return tx.productUserChanges.update({
            where: { Id: latestRequest.Id },
            data: {
              Change: change,
              ConfirmationCode: code,
              DateUpdated: now,
              DateExpires: expiresAt
            }
          });
        }

        return tx.productUserChanges.create({
          data: {
            ProductId: productId,
            Email: normalizedEmail,
            Change: change,
            ConfirmationCode: code,
            DateCreated: now,
            DateUpdated: now,
            DateExpires: expiresAt,
            DateConfirmed: null
          }
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );

    pendingRequestId = pendingRequest.Id;
  } catch (error) {
    console.error('Failed to store delete request verification code', { error, productId });
    return json({ success: false }, { status: 500 });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[UDM TEST] Verification code for ${normalizedEmail} (product ${productId}): ${code}`
    );
  }

  try {
    await sendEmail(
      [{ email: normalizedEmail, name: normalizedEmail }],
      'Your verification code',
      addProperties(EmailLayoutTemplate, {
        INSERT_SUBJECT: `Your code is: ${code}`,
        INSERT_CONTENT: `Your code is: ${code}`
      })
    );
  } catch (error) {
    await DatabaseWrites.productUserChanges.update({
      where: {
        Id: pendingRequestId
      },
      data: {
        DateUpdated: new Date(),
        DateExpires: new Date()
      }
    });
    console.error('Failed to send delete request verification email', {
      error,
      productId
    });
    return json({ success: false }, { status: 500 });
  }

  return json({ success: true });
};
