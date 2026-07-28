import type { Prisma } from '@prisma/client';
import * as v from 'valibot';
import { stringIdSchema } from '$lib/valibot';

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
    Id: true;
    DateCompleted: true;
    InitiatedBy: { select: { Name: true } };
    Comment: true;
    _count: { select: { UpdatedProducts: true } };
  };
}> &
  (
    | Prisma.SoftwareUpdatesGetPayload<{
        select: {
          DateCreated: true;
        };
      }>
    | { DateCreated: null }
  ) & {
    _count: {
      Completed?: number;
      Failed?: number;
    };
  } & {
    Organizations: (Prisma.OrganizationsGetPayload<{
      select: {
        Id: true;
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
              select: { PreviousVersion: true; Version: true; DateCompleted: true; Status: true };
            }>
          >)[];
      })[];
    } & {
      Versions: {
        ApplicationTypeId: number;
        Versions: string[];
      }[];
    })[];
  };

export type RebuildableProductsData = {
  organizations: (Prisma.OrganizationsGetPayload<{
    select: {
      Id: true;
      Name: true;
      Projects: {
        select: {
          Products: {
            select: {
              Id: true;
              ProductDefinitionId: true;
            };
          };
          Id: true;
          Name: true;
          TypeId: true;
        };
      };
    };
  }> & {
    Versions?: Prisma.SystemVersionsGetPayload<{
      select: {
        ApplicationTypeId: true;
        Version: true;
      };
    }>[];
    Projects: {
      Products: {
        PreviousVersion: string | null;
        Version: string;
      }[];
    }[];
  })[];
  presentAppTypes: Set<number>;
};

export const startFormSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1)),
  products: v.pipe(v.array(stringIdSchema))
});
