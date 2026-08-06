import { Prisma } from '@prisma/client';
import prisma from '$lib/server/database/prisma';

interface SaveDeleteRequestVerificationCodeArgs {
  productId: string;
  email: string;
  change: string;
  code: string;
  expiresAt: Date;
}

export async function saveDeleteRequestVerificationCode({
  productId,
  email,
  change,
  code,
  expiresAt
}: SaveDeleteRequestVerificationCodeArgs) {
  const now = new Date();

  // Keep only one active code per product/email so a resend invalidates older pending codes.
  return await prisma.$transaction(
    async (tx) => {
      const existingRequests = await tx.productUserChanges.findMany({
        where: {
          ProductId: productId,
          Email: email,
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
            DateExpires: expiresAt
          }
        });
      }

      return tx.productUserChanges.create({
        data: {
          ProductId: productId,
          Email: email,
          Change: change,
          ConfirmationCode: code,
          DateExpires: expiresAt,
          DateConfirmed: null
        }
      });
    },
    {
      // A resend can happen twice at once; Serializable keeps both requests from creating active codes.
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }
  );
}
