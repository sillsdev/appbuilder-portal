import type { Prisma } from '@prisma/client';

export interface RebuildItem {
  Id: number;
  InitiatedBy: string | null;
  Comment: string;
  DateCreated: Date | null;
  DateCompleted: Date | null;
  Organizations: string[];
  OrganizationIds: number[];
  Projects: {
    Id: number;
    Name: string;
    TypeId: number;
  }[];
  _count: {
    Products: number;
    Projects: number;
  };
}
export type RebuildsTable = {
  complete: RebuildItem[];
  incomplete: RebuildItem[];
};

export type UpdateSummaryData = Prisma.SoftwareUpdatesGetPayload<{
  select: {
    DateCreated: true;
    DateCompleted: true;
    InitiatedBy: { select: { Name: true } };
    Comment: true;
    _count: { select: { UpdatedProducts: true } };
  };
}> & {
  _count: {
    Completed?: number;
    Failed?: number;
  };
} & {
  Organizations: (Prisma.OrganizationsGetPayload<{
    select: {
      Name: true;
    };
  }> & {
    Projects: (Prisma.ProjectsGetPayload<{
      select: {
        Id: true;
        Name: true;
        TypeId: true;
      };
    }> & {
      Products: (Prisma.ProductsGetPayload<{
        select: { Id: true; ProductDefinitionId: true };
      }> &
        Partial<
          Prisma.SoftwareUpdatesOnProductsGetPayload<{
            select: { Version: true; DateCompleted: true; Success: true };
          }>
        > & { OldVersion?: string | null })[];
    })[];
  } & {
    Versions: {
      ApplicationTypeId: number;
      Versions: string[];
    }[];
  })[];
};
