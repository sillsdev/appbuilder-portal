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
      ProductDefinition: { select: { RebuildWorkflowId: true; RepublishWorkflowId: true } };
    };
  }> &
    MinifiedProductCard,
  projectOwnerId: number,
  userId: number
) {
  const ret: ProductActionType[] = [];
  if (!product.WT) {
    if (product.DP) {
      if (product.ProductDefinition.RebuildWorkflowId !== null) {
        ret.push(ProductActionType.Rebuild);
      }
      if (product.ProductDefinition.RepublishWorkflowId !== null) {
        ret.push(ProductActionType.Republish);
      }
    }
  } else if (projectOwnerId === userId && product.WT !== WorkflowType.Startup) {
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

export const computeTypes = ['small', 'medium'] as const;
export type ComputeType = (typeof computeTypes)[number];
export const BUILD_COMPUTE_TYPE = 'BUILD_COMPUTE_TYPE';

export function updateComputeType(properties: string | null, type?: ComputeType) {
  const toAdd = type
    ? { [BUILD_COMPUTE_TYPE]: type }
    : {
        // default value
        [BUILD_COMPUTE_TYPE]: 'small',
        BUILD_IMAGE_TAG: 'latest'
      };
  try {
    const parsed = JSON.parse(properties || '{}');
    if (parsed['environment']) {
      parsed['environment'] = {
        ...parsed['environment'],
        ...toAdd
      };
    } else {
      parsed['environment'] = { ...toAdd };
    }
    return JSON.stringify(parsed, null, 4);
  } catch {
    /* empty */
  }
  return properties;
}

export function getComputeType(properties: string | null) {
  try {
    const parsed = JSON.parse(properties || '{}');
    return (parsed['environment']?.[BUILD_COMPUTE_TYPE] as ComputeType | null) ?? null;
  } catch {
    /* empty */
  }
  return null;
}

export type MinifiedProductDetails = ReturnType<typeof minifyProductDetails>;
export function minifyProductDetails(
  product: Prisma.ProductsGetPayload<{
    select: {
      Id: true;
      BuildEngineJobId: true;
      CurrentBuildId: true;
      CurrentReleaseId: true;
      ProductBuilds: {
        select: {
          BuildEngineBuildId: true;
          TransitionId: true;
        };
      };
      ProductPublications: {
        select: {
          BuildEngineReleaseId: true;
          TransitionId: true;
        };
      };
    };
  }> & { ProductTransitions: Transition[] },
  buildEngineUrl?: string
) {
  return {
    I: product.Id,
    J: product.BuildEngineJobId,
    CB: product.CurrentBuildId,
    CR: product.CurrentReleaseId,
    PB: product.ProductBuilds.map(({ BuildEngineBuildId, TransitionId }) => ({
      I: BuildEngineBuildId,
      T: TransitionId
    })),
    PR: product.ProductPublications.map(({ BuildEngineReleaseId, TransitionId }) => ({
      I: BuildEngineReleaseId,
      T: TransitionId
    })),
    PT: product.ProductTransitions.map(minifyTransition),
    BE: buildEngineUrl
  };
}

type Transition = Prisma.ProductTransitionsGetPayload<{
  select: {
    Id: true;
    TransitionType: true;
    InitialState: true;
    WorkflowType: true;
    AllowedUserNames: true;
    Command: true;
    Comment: true;
    DateTransition: true;
    User: { select: { Name: true } };
    QueueRecords: {
      select: {
        Queue: true;
        JobId: true;
        JobType: true;
      };
    };
  };
}>;

export type MinifiedTransition = ReturnType<typeof minifyTransition>;
export function minifyTransition(pt: Transition) {
  return {
    I: pt.Id,
    T: pt.TransitionType,
    S: pt.InitialState,
    W: pt.WorkflowType,
    AU: pt.AllowedUserNames,
    Cd: pt.Command,
    Ct: pt.Comment,
    D: pt.DateTransition,
    U: pt.User?.Name,
    QR: pt.QueueRecords?.map((qr) => ({ Q: qr.Queue, I: qr.JobId, T: qr.JobType }))
  };
}

export type MinifiedProductCard = ReturnType<typeof minifyProductCard>;
export function minifyProductCard(
  product: Prisma.ProductsGetPayload<{
    select: {
      Id: true;
      DatePublished: true;
      DateUpdated: true;
      Properties: true;
      PublishLink: true;
      StoreId: true;
      ProductDefinitionId: true;
      UserTasks: {
        select: {
          UserId: true;
          DateCreated: true;
        };
      };
      WorkflowInstance: {
        select: {
          State: true;
          WorkflowDefinition: {
            select: {
              Type: true;
            };
          };
        };
      };
    };
  }>,
  ActiveTransition: Transition | undefined,
  PreviousTransition: Transition | undefined
) {
  return {
    I: product.Id,
    DP: product.DatePublished,
    DU: product.DateUpdated,
    P: product.Properties,
    L: product.PublishLink,
    S: product.StoreId,
    PD: product.ProductDefinitionId,
    UT: product.UserTasks.map((ut) => ({ U: ut.UserId, D: ut.DateCreated })),
    WS: product.WorkflowInstance && product.WorkflowInstance.State,
    WT: product.WorkflowInstance && product.WorkflowInstance.WorkflowDefinition.Type,
    AcT: ActiveTransition && minifyTransition(ActiveTransition),
    PrT: PreviousTransition && PreviousTransition.DateTransition
  };
}
