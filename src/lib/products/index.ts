import type { Prisma } from '@prisma/client';
import { WorkflowType } from '$lib/prisma';

export enum ProductActionType {
  Rebuild = 'rebuild',
  Republish = 'republish',
  Cancel = 'cancel'
}

export function getProductActions(
  product: Prisma.ProductsGetPayload<{
    select: {
      WorkflowInstance: {
        select: {
          WorkflowDefinition: {
            select: {
              Type: true;
            };
          };
        };
      };
      DatePublished: true;
      ProductDefinition: { select: { RebuildWorkflowId: true; RepublishWorkflowId: true } };
    };
  }>,
  projectOwnerId: number,
  userId: number
) {
  const ret: ProductActionType[] = [];
  if (!product.WorkflowInstance) {
    if (product.DatePublished) {
      if (product.ProductDefinition.RebuildWorkflowId !== null) {
        ret.push(ProductActionType.Rebuild);
      }
      if (product.ProductDefinition.RepublishWorkflowId !== null) {
        ret.push(ProductActionType.Republish);
      }
    }
  } else if (
    projectOwnerId === userId &&
    product.WorkflowInstance.WorkflowDefinition.Type !== WorkflowType.Startup
  ) {
    ret.push(ProductActionType.Cancel);
  }

  return ret;
}

export async function getFileInfo(url: string) {
  const res = await fetch(url, { method: 'HEAD' });
  return {
    contentType: res.headers.get('Content-Type'),
    lastModified: new Date(res.headers.get('Last-Modified') ?? 0).toISOString(),
    fileSize:
      res.headers.get('Content-Type') !== 'text/html' ? res.headers.get('Content-Length') : null
  };
}

export async function fetchPackageName(Url: string | null) {
  if (Url) {
    try {
      const response = await fetch(Url);
      if (!response.ok) {
        return null;
      }
      const name = (await response.text()).trim();
      // regex match just in case fetch returns an error HTML
      // regex slightly modified from: https://stackoverflow.com/a/69168419
      return name.match(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/i)?.at(0) ?? null;
    } catch {
      return null;
    }
  }
  return null;
}
