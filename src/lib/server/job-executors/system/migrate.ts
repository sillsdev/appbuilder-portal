import type { Prisma } from '@prisma/client';
import type { Job } from 'bullmq';
import { randomInt } from 'crypto';
import { BuildEngine } from '../../build-engine-api';
import { BullMQ, getQueues } from '../../bullmq';
import { DatabaseReads, DatabaseWrites } from '../../database';
import { JobSchedulerId } from '$lib/bullmq';
import { WorkflowState } from '$lib/workflowTypes';

export async function migrate(job: Job<BullMQ.System.Migrate>): Promise<unknown> {
  /**
   * 1. Pre-populate SystemStatuses
   */

  // 1a. Ensure default buildengine exists
  const defaultCredentials = BuildEngine.Requests.tryGetDefaultBuildEngineParameters();
  let existingDefault = await DatabaseReads.systemStatuses.findFirst({
    where: {
      OrganizationId: null
    }
  });
  existingDefault = existingDefault
    ? await DatabaseWrites.systemStatuses.update({
        where: {
          Id: existingDefault.Id
        },
        data: {
          BuildEngineUrl: defaultCredentials.url,
          BuildEngineApiAccessToken: defaultCredentials.token
        }
      })
    : await DatabaseWrites.systemStatuses.create({
        data: {
          BuildEngineUrl: defaultCredentials.url,
          BuildEngineApiAccessToken: defaultCredentials.token,
          SystemAvailable: false
        }
      });

  job.updateProgress(50);

  // 1b. Populate SystemStatuses from Organizations

  const organizations = await DatabaseReads.organizations.findMany({
    where: { System: null },
    select: {
      Id: true,
      UseDefaultBuildEngine: true,
      BuildEngineUrl: true,
      BuildEngineApiAccessToken: true
    }
  });

  if (organizations.length) {
    await DatabaseWrites.systemStatuses.createMany({
      data: organizations
        .filter((o) => o.BuildEngineUrl && o.BuildEngineApiAccessToken)
        .map((o) => ({
          BuildEngineUrl: o.BuildEngineUrl!,
          BuildEngineApiAccessToken: o.BuildEngineApiAccessToken!,
          SystemAvailable: false,
          OrganizationId: o.Id
        }))
    });
  }

  job.updateProgress(100);

  return {
    default: {
      ...existingDefault,
      BuildEngineApiAccessToken: existingDefault.BuildEngineApiAccessToken.substring(0, 4)
    },
    organizations: organizations.map((o) => ({
      ...o,
      BuildEngineApiAccessToken: o.BuildEngineApiAccessToken?.substring(0, 4)
    }))
  };
}

export async function lazyMigrate(job: Job<BullMQ.System.Migrate>): Promise<unknown> {
  const steps = Object.keys(migrationSteps).filter((k) =>
    job.data.steps?.includes(k as MigrationStep)
  ) as MigrationStep[];

  const results: [
    string,
    Error | Awaited<ReturnType<(typeof migrationSteps)[MigrationStep]['f']>>
  ][] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try {
      const op = migrationSteps[step];
      const res = await op.f(op.a);
      if (res.before && !res.after) {
        await getQueues().Emails.add(`Notify SuperAdmins of Finished Migration Step: ${step}`, {
          type: BullMQ.JobType.Email_NotifySuperAdminsLowPriority,
          messageKey: 'migrationStepFinished',
          messageProperties: {
            step
          }
        });
      }
      results.push([step, res]);
      job.updateProgress(((i + 1) * 100) / steps.length);
    } catch (e) {
      results.push([step, e as Error]);
    }
  }

  if (results.every(([_, data]) => 'after' in data && !data['after'])) {
    await getQueues().SystemRecurring.removeJobScheduler(JobSchedulerId.MigrateChunks);
    job.log('All migrations have finished... Removing task');
  }

  return Object.fromEntries(results);
}

async function associateBuildsOrReleases<Scope extends 'build' | 'release'>(scope: Scope) {
  const filter = { TransitionId: null, Success: { not: null } };
  const chunkSize = 100;

  const members = { build: 'ProductBuilds', release: 'ProductPublications' } as const;
  const member = members[scope];
  const idTypes = { build: 'BuildEngineBuildId', release: 'BuildEngineReleaseId' } as const;
  const idType = idTypes[scope];

  type Build = Prisma.ProductBuildsGetPayload<{
    select: { BuildEngineBuildId: true; DateCreated: true };
  }>;
  type Release = Prisma.ProductPublicationsGetPayload<{
    select: { BuildEngineReleaseId: true; DateCreated: true };
  }>;

  // only try to associate completed builds/releases
  const before = await DatabaseReads.products.count({
    where: { [member]: { some: filter } }
  });
  const orphaned = (await DatabaseReads.products.findMany({
    where: { [member]: { some: filter } },
    select: {
      Id: true,
      [member]: {
        where: filter,
        select: {
          [idType]: true,
          DateCreated: true
        },
        orderBy: { DateCreated: 'asc' }
      },
      ProductTransitions: {
        where: {
          InitialState:
            scope === 'build' ? WorkflowState.Product_Build : WorkflowState.Product_Publish,
          DateTransition: { not: null }
        },
        select: {
          Id: true,
          DateTransition: true
        },
        orderBy: {
          DateTransition: 'asc'
        }
      }
    },
    take: chunkSize,
    skip: Math.max(0, randomInt(before || 1) - chunkSize)
  })) as unknown as (Prisma.ProductsGetPayload<{
    select: {
      Id: true;
      ProductTransitions: { select: { Id: true; DateTransition: true } };
    };
  }> & { ProductBuilds: Build[]; ProductPublications: Release[] })[];

  const associated = await Promise.all(
    orphaned.map(async (p) => ({
      Id: p.Id,
      // find first transition where DateTransition is greater than Build.DateCreated
      // problem, date transition isn't set until build is completed... so we only do this for completed builds
      [member]: await Promise.all(
        p[member].map((obj) => {
          const narrowed = obj as Scope extends 'build' ? Build : Release;
          const id = p.ProductTransitions.find(
            (pt) =>
              pt.DateTransition!.valueOf() > obj.DateCreated!.valueOf() ||
              // or within 5 seconds
              Math.abs(pt.DateTransition!.valueOf() - obj.DateCreated!.valueOf()) < 5000
          )?.Id;

          //@ts-expect-error this is actually correct. I am tired of fighting the type system further
          const objId: number = narrowed[idType];

          if (id) {
            return DatabaseWrites.productTransitions.tryConnect(p.Id, objId, scope, id);
          } else {
            return { [idType]: objId };
          }
        })
      )
    }))
  );

  const after = await DatabaseReads.products.count({
    where: { [member]: { some: filter } }
  });

  return { before, orphaned, associated, after };
}

const migrationSteps = {
  'Associate Builds': { f: associateBuildsOrReleases, a: 'build' },
  'Associate Releases': { f: associateBuildsOrReleases, a: 'release' }
} as const;

export type MigrationStep = keyof typeof migrationSteps;
