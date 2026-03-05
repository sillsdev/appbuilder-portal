// src/routes/admin/settings/stores/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireSuperAdmin();
  const stores = await DatabaseReads.stores.findMany({
    include: {
      StoreType: true,
      Owner: { select: { Name: true } }
    }
  });

  return {
    stores,
    users: new Map(
      (
        await DatabaseReads.stores.findMany({
          select: {
            Id: true,
            Organizations: {
              select: {
                Id: true,
                Name: true
              }
            },
            Products: {
              select: {
                Project: {
                  select: {
                    OrganizationId: true
                  }
                }
              },
              distinct: 'ProjectId'
            }
          }
        })
      ).map((s) => [
        s.Id,
        s.Organizations.map((o) => ({
          Name: o.Name,
          Products: s.Products.filter((p) => p.Project.OrganizationId === o.Id).length
        })).filter((o) => !!o.Products)
      ])
    )
  };
}) satisfies PageServerLoad;
