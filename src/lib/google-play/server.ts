import { Prisma } from '@prisma/client';
import { safeParse } from 'valibot';
import { RoleId } from '$lib/prisma';
import prisma, { DatabaseReads } from '$lib/server/database/prisma';
import type { WorkflowInstanceContext } from '$lib/workflowTypes';
import { ChangeRequestAction, dataManagementJSONSchema } from '.';

interface SaveDeleteRequestVerificationCodeArgs {
  productId: string;
  email: string;
  change: string | null;
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
            Change: change ?? undefined,
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

export async function getChangeRequest(productId: string, taskId: number) {
  const request = await DatabaseReads.productUserChanges.findFirst({
    where: { ProductId: productId, Tasks: { some: { Id: taskId } }, Change: { not: null } },
    select: {
      Change: true,
      AssignedRole: true,
      Email: true,
      DateConfirmed: true,
      Product: {
        select: {
          ProductArtifacts: {
            where: { ArtifactType: 'data-management', Url: { not: null } },
            take: 1,
            orderBy: { DateCreated: 'desc' }
          }
        }
      }
    }
  });
  if (!request) return null;
  type NeededContext = Pick<
    WorkflowInstanceContext,
    'includeFields' | 'includeArtifacts' | 'includeReviewers' | 'instructions'
  >;
  const snap = {
    state: request.Change!,
    context: {
      includeFields: [],
      includeArtifacts: null,
      includeReviewers: false,
      instructions: 'manage_data'
    } satisfies NeededContext,
    input: {}
  };

  let consoleUrl: string = '';
  try {
    const artifactUrl = request.Product.ProductArtifacts.at(0)?.Url;
    const artifact = artifactUrl && (await fetch(artifactUrl).then((r) => r.text()));
    const parsed = safeParse(dataManagementJSONSchema, artifact);
    if (parsed.success) {
      consoleUrl = parsed.output.console_url;
    }
  } catch {
    // empty
  }

  return {
    snap: snap as { state: string; context: NeededContext; input: unknown },
    actions: [
      ChangeRequestAction.Mark_Complete,
      request.AssignedRole === RoleId.AppBuilder
        ? ChangeRequestAction.Transfer_to_Admin
        : ChangeRequestAction.Transfer_to_Owner
    ],
    request: {
      email: request.Email,
      submitted: request.DateConfirmed,
      consoleUrl
    }
  };
}
