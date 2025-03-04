import { WorkflowType } from "sil.appbuilder.portal.common/prisma";

export enum ProductActionType {
  Rebuild = 'rebuild',
  Republish = 'republish',
  Cancel = 'cancel'
}

export function getProductActions(
  product: {
    WorkflowInstance: {
      WorkflowDefinition: {
        Type: WorkflowType;
      };
    } | null;
    DatePublished: unknown;
    ProductDefinition: { RebuildWorkflowId: unknown; RepublishWorkflowId: unknown };
  },
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
    fileSize: res.headers.get('Content-Type') !== 'text/html'? res.headers.get('Content-Length') : null
  }
}