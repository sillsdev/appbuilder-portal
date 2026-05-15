import type { Prisma } from '@prisma/client';

// Creates a standardized AppBuilders error response
export function createAppBuildersError(status: number, title: string) {
  return new Response(JSON.stringify({ errors: [{ title }] }), { status });
}

// filter for rebuildable products
export function rebuildableProductsWhere(projectId: number, ownerId: number) {
  return {
    ProjectId: projectId,
    Project: { Owner: { Id: ownerId } },
    DatePublished: { not: null },
    PublishLink: { not: null },
    WorkflowInstance: null,
    ProductDefinition: { RebuildWorkflowId: { not: null } }
  } satisfies Prisma.ProductsWhereInput;
}
